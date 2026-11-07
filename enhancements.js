/* KINOTEATR / LIVE + INTERACTIVE. No private Discord credentials in browser code. */
(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const config = window.KINOTEATR_LIVE || {};
  const header = $('.site-header .nav');

  // One subtle button to opt in to interface sound. Browsers will never autoplay it.
  const soundButton = document.createElement('button');
  soundButton.className = 'sound-toggle';
  soundButton.type = 'button';
  soundButton.title = 'Включить звуки интерфейса';
  soundButton.setAttribute('aria-label', 'Включить звуки интерфейса');
  soundButton.setAttribute('aria-pressed', 'false');
  soundButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4V9z"/><path d="m17 9 4 6m0-6-4 6" class="muted-cross"/></svg>';
  header?.insertBefore(soundButton, $('.mobile-toggle', header));
  let audioContext;
  let soundEnabled = false;
  function beep(frequency = 500, duration = .08, type = 'sine') {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.16, now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.035, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + duration + .01);
    } catch { /* WebAudio unavailable: keep the rest of the site usable. */ }
  }
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? 'Выключить звуки интерфейса' : 'Включить звуки интерфейса');
    soundButton.title = soundEnabled ? 'Выключить звуки интерфейса' : 'Включить звуки интерфейса';
    soundButton.querySelector('.muted-cross')?.setAttribute('visibility', soundEnabled ? 'hidden' : 'visible');
    beep(660,.1);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('#spin-button')) { beep(330,.17,'triangle'); return; }
    if (event.target.closest('.game-card')) { beep(720,.08); return; }
    if (event.target.closest('button,a[href^="#"],summary') && !event.target.closest('.sound-toggle')) beep(490,.055);
  });

  // Fixed thin progress line, updated on scroll without layout shifts.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
    scheduled = false;
  }
  addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateProgress);
  }, { passive:true });
  addEventListener('resize', updateProgress, { passive:true });
  updateProgress();

  // Lightweight 3D projected particle field. Stays behind all readable content.
  const hero = $('.hero');
  if (hero && !reduce && pointer) {
    const canvas = document.createElement('canvas');
    canvas.className = 'depth-field';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d', { alpha:true });
    if (ctx) {
      const stars = Array.from({length:95}, () => ({x:(Math.random()-.5)*2.7,y:(Math.random()-.5)*2.2,z:Math.random()*2+.2,r:Math.random()*1.5+.45}));
      let w=0,h=0,mouseX=0,mouseY=0,targetX=0,targetY=0,frame=0,visible=true;
      function resizeCanvas() {
        const rect=hero.getBoundingClientRect();
        const ratio=Math.min(devicePixelRatio||1,1.5);
        w=Math.max(1,rect.width);h=Math.max(1,rect.height);
        canvas.width=Math.round(w*ratio); canvas.height=Math.round(h*ratio);
        ctx.setTransform(ratio,0,0,ratio,0,0);
      }
      resizeCanvas();
      new ResizeObserver(resizeCanvas).observe(hero);
      hero.addEventListener('pointermove',event => {
        const rect=hero.getBoundingClientRect();
        targetX=(event.clientX-rect.left)/rect.width-.5;
        targetY=(event.clientY-rect.top)/rect.height-.5;
      },{passive:true});
      hero.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
      new IntersectionObserver(entries => {visible=entries[0].isIntersecting;},{threshold:0}).observe(hero);
      function render() {
        requestAnimationFrame(render);
        if (!visible || document.hidden) return;
        frame++;
        if (frame%2) return;
        mouseX+=(targetX-mouseX)*.035;
        mouseY+=(targetY-mouseY)*.035;
        ctx.clearRect(0,0,w,h);
        const scale=Math.min(w,h)*.62;
        for(const star of stars) {
          star.z-=.0025;
          if(star.z<.17) {star.z=2.2;star.x=(Math.random()-.5)*2.7;star.y=(Math.random()-.5)*2.2;}
          const z=star.z+.28;
          const x=w*.5+(star.x-mouseX*.6)*scale/z;
          const y=h*.48+(star.y-mouseY*.4)*scale/z;
          if(x<0||x>w||y<0||y>h) continue;
          const alpha=Math.min(.42,(2.1-z)/2.2*.37)+.04;
          ctx.fillStyle=`rgba(214,255,89,${alpha.toFixed(3)})`;
          const radius=Math.min(3,star.r*2/z);
          ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
          if(radius>1.6) {
            ctx.strokeStyle=`rgba(214,255,89,${Math.min(.2,alpha*.5).toFixed(3)})`;
            ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-w*.5)*.035,y+(y-h*.5)*.035);ctx.stroke();
          }
        }
      }
      render();
    }
  }

  // LIVE panel: no fabricated data. Discord widget offers online count;
  // the separate authorized bot API is necessary for tracked game activity.
  const liveSection=document.createElement('section');
  liveSection.className='live-section';
  liveSection.id='live';
  liveSection.setAttribute('aria-labelledby','live-title');
  liveSection.innerHTML=`
    <div class="container live-layout">
      <div class="live-intro">
        <div class="live-kicker">004 / СИГНАЛ ИЗ DISCORD</div>
        <h2 id="live-title">ПРЯМО <span>СЕЙЧАС.</span></h2>
        <p>Не просто красивый счётчик. Тут будет настоящий онлайн нашего сервера — и игры, которые запущены у участников прямо сейчас.</p>
        <div class="live-state" id="live-state" data-state="waiting" role="status"><i aria-hidden="true"></i><span>ОЖИДАЕМ ПОДКЛЮЧЕНИЯ DISCORD</span></div>
      </div>
      <div class="live-panel" aria-label="Статистика Discord-сервера">
        <div class="live-panel-top"><span>КИНОТЕАТР® / COMMUNITY MONITOR</span><span>● LIVE FEED</span></div>
        <div class="live-metrics" aria-live="polite" aria-atomic="true">
          <div class="live-metric"><strong data-count="members">—</strong><span>УЧАСТНИКОВ ВСЕГО</span></div>
          <div class="live-metric"><strong data-count="online">—</strong><span>СЕЙЧАС В СЕТИ</span></div>
          <div class="live-metric"><strong data-count="playing">—</strong><span>В ИГРАХ СЕЙЧАС</span></div>
        </div>
        <div class="live-games-header"><span>ВО ЧТО ИГРАЮТ</span><span>ACTIVE SESSIONS / 04</span></div>
        <div class="live-games">
          ${[['arizona','ARIZONA RP'],['dota','DOTA 2'],['cs2','CS2'],['minecraft','MINECRAFT']].map(([id,name])=>`<div class="live-game" data-live-game="${id}"><span class="live-game-label">${name}</span><div class="live-bar"><span></span></div><strong class="live-game-value">—</strong></div>`).join('')}
        </div>
        <div class="live-panel-foot"><span id="live-caption">Данные появятся после подключения сервера. Никаких выдуманных цифр.</span><span id="live-updated">—:—</span></div>
      </div>
    </div>`;
  const games=$('#games');
  games?.parentNode.insertBefore(liveSection,games);
  const navLinks=$('#nav-links');
  const liveLink=document.createElement('a');
  liveLink.href='#live';liveLink.textContent='Онлайн';
  navLinks?.insertBefore(liveLink,navLinks.querySelector('a[href="#roulette"]'));
  liveLink.addEventListener('click',()=>{
    navLinks?.classList.remove('is-open');
    const toggle=$('#mobile-toggle');
    toggle?.setAttribute('aria-expanded','false');
    toggle?.querySelector('use')?.setAttribute('href','#icon-menu');
  });
  const metric=(name)=>$(`[data-count="${name}"]`,liveSection);
  const label=$('#live-caption');
  const updated=$('#live-updated');
  const state=$('#live-state');
  function setState(type,message){state.dataset.state=type;state.querySelector('span').textContent=message;}
  function applyStats(data) {
    // Numbers are validated, never accepted as HTML from an external endpoint.
    if (!data || typeof data !== 'object') throw Error('Bad response');
    const isCount=n=>Number.isSafeInteger(n)&&n>=0;
    let hasAny=false;
    for(const key of ['members','online','playing']) {
      if(isCount(data[key])) {metric(key).textContent=Intl.NumberFormat('ru-RU').format(data[key]);hasAny=true;}
      else metric(key).textContent='—';
    }
    const games=data.games&&typeof data.games==='object'?data.games:{};
    const max=Math.max(1,...['arizona','dota','cs2','minecraft'].map(id=>isCount(games[id])?games[id]:0));
    for(const row of liveSection.querySelectorAll('[data-live-game]')) {
      const amount=games[row.dataset.liveGame];
      row.querySelector('.live-game-value').textContent=isCount(amount)?String(amount):'—';
      row.querySelector('.live-bar > span').style.width=isCount(amount)?`${amount/max*100}%`:'0%';
    }
    if (!hasAny) throw Error('No accessible counts');
    setState('connected',data.source==='widget'?'ОНЛАЙН ПОДКЛЮЧЁН · ИГРЫ ЖДУТ БОТА':'LIVE · ДАННЫЕ DISCORD');
    label.textContent=data.source==='widget'?'Онлайн из публичного виджета Discord. Для данных по играм нужен бот.':'Только суммарные данные. Неактивные и скрытые игры не учитываются.';
    const d=data.updatedAt?new Date(data.updatedAt):new Date();
    updated.textContent=Number.isNaN(d.getTime())?'ОБНОВЛЕНО':`ОБНОВЛЕНО ${d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`;
  }
  async function loadStats(){
    const apiUrl=typeof config.apiUrl==='string'?config.apiUrl.trim():'';
    const guildId=typeof config.guildId==='string'?config.guildId.trim():'';
    if (!apiUrl&&!/^\d{17,22}$/.test(guildId)) return;
    try {
      const url=apiUrl || `https://discord.com/api/guilds/${guildId}/widget.json`;
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),7500);
      let response;
      try {response=await fetch(url,{signal:controller.signal,cache:'no-store'});}
      finally {clearTimeout(timer);}
      if(!response.ok) throw Error(`HTTP ${response.status}`);
      const json=await response.json();
      applyStats(apiUrl?json:{members:null,online:json.presence_count,playing:null,games:{},source:'widget'});
    } catch {
      setState('error','DISCORD НЕ ОТВЕЧАЕТ · ПРОБУЕМ ПОЗЖЕ');
      for (const node of liveSection.querySelectorAll('[data-count],.live-game-value')) node.textContent='—';
      for (const bar of liveSection.querySelectorAll('.live-bar > span')) bar.style.width='0%';
      updated.textContent='НЕТ ДАННЫХ';
      label.textContent='Статистика временно недоступна. Сайт и другие функции работают.';
    }
  }
  loadStats();
  setInterval(()=>{if(!document.hidden)loadStats();},45000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadStats();});

  // Extra scroll depth: GSAP is already loaded for the original sections.
  addEventListener('load',()=>{
    if(!reduce&&window.gsap&&window.ScrollTrigger){
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.from('.live-intro > *',{y:38,opacity:0,stagger:.12,duration:.8,ease:'power3.out',scrollTrigger:{trigger:'.live-section',start:'top 76%',once:true}});
      window.gsap.from('.live-panel',{y:65,rotationX:7,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.live-section',start:'top 75%',once:true}});
      window.gsap.to('.hero-art',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    }
  },{once:true});

  // Secret code: ↑ ↑ ↓ ↓ ← → ← → B A. No hidden data or admin privileges.
  const code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let position=0;
  const secret=document.createElement('div');
  secret.className='secret-banner';
  secret.innerHTML='<button class="secret-close" type="button" aria-label="Закрыть пасхалку">×</button><small>✳ / SECRET UNLOCKED</small><strong>АРКАДНЫЙ РЕЖИМ АКТИВИРОВАН.</strong><p>Ты нашёл тайный чит-код. Никакого админ-доступа, только немного хаоса. 👾</p>';
  document.body.append(secret);
  secret.querySelector('button').addEventListener('click',()=>secret.classList.remove('is-visible'));
  document.addEventListener('keydown',event=>{
    if(event.target.closest('input,textarea,[contenteditable="true"]'))return;
    if(event.key===code[position])position++;
    else position=event.key===code[0]?1:0;
    if(position===code.length){
      position=0;document.body.classList.toggle('arcade-mode');
      secret.classList.add('is-visible');beep(880,.2,'triangle');
    }
    if(event.key==='Escape')secret.classList.remove('is-visible');
  });
})();
