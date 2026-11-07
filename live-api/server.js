/*
 * КИНОТЕАТР / LIVE API
 * Returns only aggregated counts. Never exposes usernames, activities, or tokens.
 * Run with Node >=20. Public guild widget is a no-bot fallback for online count.
 */
'use strict';
const http = require('node:http');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const PORT = Math.max(1, Number.parseInt(process.env.PORT || '3000', 10));
const GUILD_ID = (process.env.DISCORD_GUILD_ID || '').trim();
const TOKEN = (process.env.DISCORD_BOT_TOKEN || '').trim();
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://yalacom.github.io,http://localhost:8000,http://127.0.0.1:8000')
  .split(',').map(origin => origin.trim()).filter(Boolean);

if (!/^\d{17,22}$/.test(GUILD_ID)) {
  console.error('Set DISCORD_GUILD_ID in your environment.');
  process.exit(1);
}

let client = null;
let lastWidget = null;
let lastWidgetAt = 0;

if (TOKEN) {
  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences]
  });
  client.once('ready', () => console.log(`Discord bot ready as ${client.user?.username || 'unknown'}.`));
  client.on('error', error => console.error('Discord gateway error:', error.message));
  client.login(TOKEN).catch(error => console.error('Discord login failed:', error.message));
} else {
  console.log('No bot token. Public widget-only mode: online count (if enabled), no games.');
}

async function getWidget() {
  if (Date.now() - lastWidgetAt < 25_000) return lastWidget;
  lastWidgetAt = Date.now();
  try {
    const response = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, {
      headers: { 'User-Agent': 'KinoteatrLive/1.0 (community dashboard)' },
      signal: AbortSignal.timeout(4500)
    });
    if (!response.ok) throw new Error(`Discord widget returned ${response.status}`);
    const data = await response.json();
    lastWidget = Number.isInteger(data.presence_count) ? data.presence_count : null;
  } catch (error) {
    console.warn('Widget unavailable:', error.message);
    // On failure, retain last previously verified count for this process.
  }
  return lastWidget;
}

const gameIds = ['arizona', 'dota', 'cs2', 'minecraft'];
const gameMatchers = {
  arizona: /\barizona(?:\s*(?:rp|roleplay))?\b/i,
  dota: /\bdota\s*2\b/i,
  cs2: /\b(?:counter[\s-]*strike\s*2|cs\s*2)\b/i,
  minecraft: /\bminecraft\b/i
};

function aggregate(guild) {
  const games = Object.fromEntries(gameIds.map(key => [key, 0]));
  let playing = 0;
  let online = 0;
  // A member is counted once per game, even if Discord reports multiple activities.
  // This counts visible Playing activities only, never hidden/invisible sessions.
  for (const presence of guild.presences.cache.values()) {
    if (!presence || presence.status === 'offline') continue;
    online++;
    const active = presence.activities.filter(a => a.type === ActivityType.Playing);
    if (active.length) playing++;
    for (const [key, pattern] of Object.entries(gameMatchers)) {
      if (active.some(activity => pattern.test(activity.name || ''))) games[key]++;
    }
  }
  return { members: guild.memberCount ?? null, online, playing, games };
}

async function getStats() {
  const widgetOnline = await getWidget();
  const guild = client?.isReady() ? client.guilds.cache.get(GUILD_ID) : null;
  if (guild) {
    const result = aggregate(guild);
    if (typeof widgetOnline === 'number') result.online = widgetOnline;
    return { ...result, source: 'bot', updatedAt: new Date().toISOString() };
  }
  if (typeof widgetOnline === 'number') {
    return { members: null, online: widgetOnline, playing: null, games: null, source: 'widget', updatedAt: new Date().toISOString() };
  }
  return null;
}

function jsonResponse(res, status, data, origin) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=15',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin',
    ...(origin && ALLOWED_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {})
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const path = (req.url || '').split('?')[0];
  if (req.method !== 'GET') return jsonResponse(res, 405, { error: 'Method not allowed' }, origin);
  if (path === '/health') return jsonResponse(res, 200, { ok: true, bot: Boolean(client?.isReady()), widget: lastWidget !== null }, origin);
  if (path !== '/api/stats') return jsonResponse(res, 404, { error: 'Not found' }, origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return jsonResponse(res, 403, { error: 'Origin not allowed' }, origin);
  try {
    const result = await getStats();
    if (!result) return jsonResponse(res, 503, { error: 'Discord is unavailable', source: 'unavailable' }, origin);
    jsonResponse(res, 200, result, origin);
  } catch (error) {
    console.error('Stats error:', error.message);
    jsonResponse(res, 503, { error: 'Stats temporarily unavailable' }, origin);
  }
});
server.listen(PORT, '0.0.0.0', () => console.log(`KINOTEATR live API listening on ${PORT}`));
process.on('SIGTERM', () => { client?.destroy(); server.close(); });
