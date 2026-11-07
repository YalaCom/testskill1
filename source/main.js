/*
  КИНОТЕАТР — website settings.
  1. Add your REAL Discord invite URL between the quotation marks.
  2. All Discord buttons will automatically open that invite.
  3. Without a URL the buttons show an informative preview modal instead.
*/
const DISCORD_INVITE = "";

const GAMES = {
  arizona: {
    title: "ARIZONA RP",
    kicker: "01 / ROLEPLAY / ОТКРЫТЫЙ МИР",
    image: "./assets/arizona.svg",
    alt: "Город и автомобиль на закате",
    description: "Вторая жизнь, нескончаемые истории и движ, о котором потом вспоминают в войсе. Собирай компанию и залетай в Аризону."
  },
  dota: {
    title: "DOTA 2",
    kicker: "02 / MOBA / КОМАНДНАЯ ИГРА",
    image: "./assets/dota.svg",
    alt: "Фэнтезийный воин и огненные руны",
    description: "Один хороший драфт, одна слаженная команда и ещё одна «точно последняя» катка. Найди тех, с кем весело даже проигрывать."
  },
  cs2: {
    title: "COUNTER-STRIKE 2",
    kicker: "03 / FPS / 5 НА 5",
    image: "./assets/cs2.svg",
    alt: "Боец в оранжевом свете",
    description: "Ищешь пати на Premier, хочешь поугарать в обычке или собрать полный стак? У нас всегда есть повод сказать «го CS»."
  },
  minecraft: {
    title: "MINECRAFT",
    kicker: "04 / SANDBOX / БЕЗ ГРАНИЦ",
    image: "./assets/minecraft.svg",
    alt: "Блочный ландшафт и дерево",
    description: "От уютного домика до безумной стройки. Собирай друзей, осваивай новые миры и защищай свой сундук от самых близких."
  }
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const inviteModal = $('#invite-modal');
const gameModal = $('#game-modal');
const toast = $('#toast');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3300);
}

function openDialog(dialog) {
  if (!dialog) return;
  $$('.site-modal[open]').forEach(other => { if (other !== dialog) other.close(); });
  if (!dialog.open) dialog.showModal();
}

function validDiscordUrl(value) {
  if (!value || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' && (
      parsed.hostname === 'discord.gg' ||
      (parsed.hostname === 'discord.com' && parsed.pathname.startsWith('/invite/')) ||
      (parsed.hostname === 'discordapp.com' && parsed.pathname.startsWith('/invite/'))
    );
  } catch { return false; }
}

function joinDiscord() {
  if (validDiscordUrl(DISCORD_INVITE)) {
    window.open(DISCORD_INVITE.trim(), '_blank', 'noopener,noreferrer');
  } else {
    openDialog(inviteModal);
  }
}

$$('.discord-trigger').forEach(button => button.addEventListener('click', joinDiscord));
$$('[data-close-modal]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
$$('.site-modal').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
});

// Cards behave the same for mouse, touch and keyboard users.
function openGame(id) {
  const game = GAMES[id];
  if (!game || !gameModal) return;
  $('#game-modal-title').textContent = game.title;
  $('#game-modal-kicker').textContent = '✳ / ' + game.kicker;
  $('#game-modal-description').textContent = game.description;
  const art = $('#game-modal-image');
  art.src = game.image;
  art.alt = game.alt;
  openDialog(gameModal);
}
$$('.game-card').forEach(card => {
  card.addEventListener('click', () => openGame(card.dataset.game));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGame(card.dataset.game);
    }
  });
});

// Mobile navigation.
const menuToggle = $('#mobile-toggle');
const navLinks = $('#nav-links');
function setMenu(isOpen) {
  navLinks?.classList.toggle('is-open', isOpen);
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
  menuToggle?.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  const use = $('use', menuToggle);
  if (use) use.setAttribute('href', isOpen ? '#icon-close' : '#icon-menu');
}
menuToggle?.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
$$('.nav-links a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});
window.addEventListener('resize', () => { if (window.innerWidth > 1040) setMenu(false); }, { passive: true });

// Sticky header appearance.
const header = $('.site-header');
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    header?.classList.toggle('is-sticky', window.scrollY > 30);
    ticking = false;
  });
}, { passive: true });

// The actual four-segment roulette. The pointer remains stationary at 12 o'clock.
const spinButton = $('#spin-button');
const wheel = $('#game-wheel');
const rouletteResult = $('#roulette-result');
const rouletteVisual = $('.roulette-visual');
const rouletteChoices = [
  { name: 'ARIZONA RP', detail: 'Сегодня пишем собственную историю.' },
  { name: 'DOTA 2', detail: 'Последняя катка. Правда-правда.' },
  { name: 'CS2', detail: 'Зови стак, пора забирать раунды.' },
  { name: 'MINECRAFT', detail: 'Время строить и случайно взрывать.' }
];
let rotation = 0;
let isSpinning = false;
let spinCount = 0;

function burstConfetti() {
  if (reducedMotion.matches) return;
  const colors = ['#d6ff59', '#c8b7e9', '#eaa980', '#9fb6b7', '#e9e8dc'];
  for (let i = 0; i < 27; i++) {
    const confetti = document.createElement('i');
    confetti.className = 'confetti';
    confetti.style.background = colors[i % colors.length];
    confetti.style.setProperty('--dx', `${(Math.random() - .5) * 900}px`);
    confetti.style.setProperty('--dy', `${(Math.random() - .6) * 700}px`);
    confetti.style.setProperty('--rotation', `${Math.round(Math.random() * 1200 - 600)}deg`);
    confetti.style.animationDelay = `${Math.random() * .12}s`;
    confetti.style.borderRadius = i % 4 === 0 ? '50%' : '1px';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1700);
  }
}

function spinRoulette() {
  if (isSpinning || !wheel || !rouletteResult) return;
  isSpinning = true;
  const index = Math.floor(Math.random() * rouletteChoices.length);
  const target = (360 - index * 90) % 360;
  const offset = (target - (rotation % 360) + 360) % 360;
  rotation += 360 * 6 + offset;
  spinButton.disabled = true;
  spinButton.style.opacity = '.75';
  rouletteVisual.classList.add('is-spinning');
  rouletteResult.innerHTML = '<span>РЕЗУЛЬТАТ / ···</span><strong>ВЫБИРАЕМ СУДЬБУ...</strong><small>Колесо уже всё решило. Почти.</small>';
  wheel.style.transform = `rotate(${rotation}deg)`;
  const duration = reducedMotion.matches ? 50 : 4650;
  setTimeout(() => {
    spinCount++;
    const result = rouletteChoices[index];
    rouletteResult.innerHTML = `<span>РЕЗУЛЬТАТ / ${String(spinCount).padStart(3, '0')}</span><strong>${result.name} <span>↗</span></strong><small>${result.detail}</small>`;
    burstConfetti();
    rouletteVisual.classList.remove('is-spinning');
    spinButton.disabled = false;
    spinButton.style.opacity = '';
    isSpinning = false;
  }, duration);
}
spinButton?.addEventListener('click', spinRoulette);

// Premium details: ticket tilt on desktop, elegant GSAP entrance/reveal when available.
const ticket = $('#hero-ticket');
const art = $('.hero-art');
if (ticket && art && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reducedMotion.matches) {
  art.addEventListener('pointermove', event => {
    const rect = art.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 14;
    ticket.style.transform = `translate(-50%,-50%) rotate(-12deg) rotateY(${-10 + x}deg) rotateX(${-y}deg)`;
  });
  art.addEventListener('pointerleave', () => {
    ticket.style.transform = 'translate(-50%,-50%) rotate(-12deg) rotateY(-10deg) rotateX(0deg)';
  });
}

function animatePage() {
  if (!window.gsap || reducedMotion.matches) return;
  const gsap = window.gsap;
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTimeline
    .from('.hero-eyebrow', { y: 20, autoAlpha: 0, duration: .7 })
    .from('.title-row-one', { y: 65, autoAlpha: 0, duration: .8 }, '-=.35')
    .from('.title-row-two', { y: 65, autoAlpha: 0, duration: .8 }, '-=.62')
    .from(['.hero-caption', '.hero-actions'], { y: 25, autoAlpha: 0, duration: .7, stagger: .12 }, '-=.36')
    .from('.ticket', { scale: .78, rotate: -25, autoAlpha: 0, duration: 1.15, ease: 'back.out(1.15)' }, '-=1.3')
    .from('.floating-sticker', { scale: .6, autoAlpha: 0, stagger: .16, duration: .5 }, '-=.42');
  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.from(element, {
        y: 45, autoAlpha: 0, duration: .85, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 92%', once: true }
      });
    });
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', animatePage, { once: true });
} else {
  animatePage();
}

// Small secret for curious visitors: type K I N O anywhere outside inputs.
let secretKeys = '';
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,[contenteditable="true"]')) return;
  if (event.key.length !== 1) return;
  secretKeys = (secretKeys + event.key.toLowerCase()).slice(-4);
  if (secretKeys === 'kino' || secretKeys === 'кино') {
    showToast('🎬 А кино сегодня не будет. Зато будет движ!');
    burstConfetti();
    secretKeys = '';
  }
});

$('#year').textContent = String(new Date().getFullYear());
