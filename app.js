'use strict';
/*
  РИТМ — локальный тренажёр. Все результаты хранятся только в localStorage.
  WPM: число символов, совпавших с образцом, / 5 / минуты.
  Raw WPM: все набранные символы, включая исправленные, / 5 / минуты.
  Accuracy: верные нажатия / все введённые символы (ошибки после Backspace не стираются).
*/
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = 'ritm.typing.v1';
const RU = 'время человек жизнь дело слово работа мир день рука глаза место город дом вода книга путь друг мысль письмо вопрос ответ слово новый хороший большой маленький русский печать скорость клавиатура буква строка экран текст навык учиться ровно просто тихо быстро точно красиво спокойно рядом вместе всегда иногда сегодня завтра вчера сейчас после скоро снова каждый один два три пять много мало можно нужно важно если когда где почему потому между вперед назад рядом далеко верно снова пока тоже только уже потом быть делать видеть писать читать думать смотреть говорить знать искать находить новое старое чистый свет темно воздух утро вечер ночь солнце дождь снег ветер весна осень лето зима окно дорога берег лес поле река море волна камень песок голос музыка звук песня мечта идея план цель успех ошибка помощь правило опыт задача результат развитие движение внимание время минута секунда работа порядок чувство энергия комната стол стул дверь ветер далеко друг игра победа команда начало конец история герой момент привычка терпение польза качество смысл идея тихий быстрый добрый смелый умный свободный добрый верный честный легкий сложный простой очень каждый наш ваш свой любой новый другой первый последний долго коротко редко часто почти совсем здесь там сюда туда откуда кто что какой такой моя твоя наша ваша его её себе себя друзья конечно спасибо пожалуйста привет доброе хорошо отлично удобно уверенно стараться ритм развитие счастье сила пальцы движение пробел строчка мыслить отдых пауза поворот выбор возможность память мастерство тонко реально завтра успех лучше стабильность практика тренировка внимание минута буквы текст ввод результат'.split(' ');
const EN = 'the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were type typing speed keyboard keys learn practice focus accuracy improve better quick slow calm right wrong correct word words text sentence paragraph line place sound rhythm hand finger home row left right fast strong easy hard simple clear grow skill focus practice learn master today tomorrow every minute morning night computer screen track results progress session challenge level daily keep move build habits motion smooth enjoy attention future stay precise enough change ready start finish next again work time smart strong voice quiet person good great small big true from above below around story find take make feel world idea light dark home nature mind brain shape movement stable consistent careful steady touch reach hands fingers smile love fun game play start stop reset share learn daily trust gain focus repeat improve practise sentence quote accurate letter special numbers signs point thought quick brown fox jumps lazy dog'.split(' ');
const QUOTES = {
  ru: [
    'Большая скорость начинается не с быстрых пальцев, а с привычки замечать каждую букву. Найди спокойный ритм, и движение станет естественным.',
    'Не пытайся победить таймер. Лучше сосредоточься на следующей клавише, сохрани ровное дыхание и дай себе время освоить новый навык.',
    'Сегодня достаточно нескольких внимательных минут. Завтра ты заметишь, что руки помнят привычные движения лучше, чем вчера.',
    'Уверенная печать помогает не отвлекаться от мысли. Когда не приходится искать буквы, больше внимания остаётся для того, что действительно важно.'
  ],
  en: [
    'Speed is not the first goal. Learn to find each key without looking down, keep a gentle rhythm, and let your confidence grow with every session.',
    'A small habit repeated every day can change how comfortably you work. Type with care, notice the hard letters, and try again tomorrow.',
    'There is no need to race against the clock. Focus on the next word and give your hands time to learn a natural and comfortable movement.',
    'Good practice is not always fast. A few minutes of steady attention can teach you more than a long session full of rushed mistakes.'
  ]
};
const LESSONS = [
  { title:'Первые клавиши',description:'Найди две опорные клавиши и научись возвращаться к ним.',ru:'а о а о о а а о а а о о а о а о о а а о а а о о а о а о а а о о а о а о',en:'f j f j j f f j f f j j f j f j j f f j f f j j f j f j f f j j f j f j'},
  { title:'Домашний ряд',description:'Опорная позиция. Осваиваем пальцы без взгляда вниз.',ru:'ф ы в а п р о л д ж фыва олдж а о л д ж п р а в ф ы ж о л д а р п ф ы в а олдж',en:'a s d f g h j k l a s d f j k l g h asdf jkl f g h j k l a s d f j k l'},
  { title:'Верхний ряд',description:'Тренируем движение пальцев к верхним буквам.',ru:'й ц у к е н г ш щ з х й ц у к е н г ш щ з х у к е н г ш ц й з х г у е к н ш',en:'q w e r t y u i o p q w e r t y u i o p we were your pure type write quiet tree'},
  { title:'Нижний ряд',description:'Подключаем нижние клавиши и возвращаем руки домой.',ru:'я ч с м и т ь б ю я ч с м и т ь б ю я ч с м и т ь б ю смотри тишина мир уют',en:'z x c v b n m z x c v b n m z x c v b n m mix box can move nice calm'},
  { title:'Переходы',description:'Слова с разными сочетаниями букв. Ищи плавный ритм.',ru:'мир дом стол вода книга рука берег солнце дорога привычка письмо слово работа мысль легко очень здесь сегодня завтра',en:'water world walk word wonder little yellow quick paper people happy every simple keyboard correct learn new day'},
  { title:'Заглавные буквы',description:'Учимся нажимать Shift и удерживать точность.',ru:'Ритм Время Свет Идея Сила Путь Город Мир Дом Книга Начало Сегодня Завтра Россия Москва Печать',en:'Today Monday Friday Open Focus Better Great World River Keyboard Practice First Every Good Day'},
  { title:'Цифры и знаки',description:'Добавляем цифры и знаки препинания к привычным словам.',ru:'1 2 3 4 5 6 7 8 9 0 12 25 50 100 2026 время, слово. снова, успех! новый день, 15 минут.',en:'1 2 3 4 5 6 7 8 9 0 12 25 50 100 2026 time, word. again, great! one day, 15 minutes.'},
  { title:'Свободный ритм',description:'Финиш курса: небольшой связный текст и уверенное движение.',ru:'Сегодня хороший день, чтобы учиться новому. Печатай спокойно и точно. Следи за буквами, не торопись и помни: каждый маленький шаг помогает двигаться вперед.',en:'Today is a good day to learn something new. Type carefully and keep a steady rhythm. Small steps help you build a skill that will stay with you for years.'}
];
const TIPS = [
 'Начни с точности: регулярные правильные движения важнее рекорда.',
 'Почувствуй небольшие выступы на клавишах F и J.',
 'После ошибки исправь её и спокойно продолжай дальше.',
 'Смотри на текст, а не на свои пальцы.',
 'Делай короткие паузы: напряжённые кисти не помогают скорости.',
 'Лучше несколько коротких тренировок в неделю, чем редкие марафоны.'
];
const keyboardRows = { ru: ['йцукенгшщзхъ','фывапролджэ','ячсмитьбю.'], en: ['qwertyuiop','asdfghjkl;','zxcvbnm,./'] };
const HOME = {ru:['а','о'],en:['f','j']};
const settings = {mode:'time',lang:'ru',seconds:30,wordCount:25,quote:0,lesson:0,weakCount:25,punctuation:false,numbers:false,sound:false,theme:'light'};
let db = { history:[], completed:{ru:[],en:[]}, mistakes:{ru:{},en:{}}, settings:{} };
try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (parsed && typeof parsed === 'object') {
    db = {
      history: Array.isArray(parsed.history) ? parsed.history.filter(v=>v&&typeof v==='object').slice(-150) : [],
      completed: {ru: Array.isArray(parsed.completed?.ru) ? parsed.completed.ru : [],en:Array.isArray(parsed.completed?.en) ? parsed.completed.en : []},
      mistakes: {ru: parsed.mistakes?.ru&&typeof parsed.mistakes.ru==='object' ? parsed.mistakes.ru : {},en:parsed.mistakes?.en&&typeof parsed.mistakes.en==='object' ? parsed.mistakes.en : {}},
      settings: parsed.settings && typeof parsed.settings==='object' ? parsed.settings : {}
    };
  }
} catch {/* Incognito / corrupted storage: app still works */}
for (const k of Object.keys(settings)) {
  const v = db.settings[k];
  if (v !== undefined && typeof v === typeof settings[k]) settings[k] = v;
}
if (!['time','words','lesson','quote','weak'].includes(settings.mode)) settings.mode='time';
if (!['ru','en'].includes(settings.lang)) settings.lang='ru';
if (![15,30,60,120].includes(settings.seconds)) settings.seconds=30;
if (![25,50,100].includes(settings.wordCount)) settings.wordCount=25;
if (![25,50,100].includes(settings.weakCount)) settings.weakCount=25;
settings.lesson=Math.max(0,Math.min(7,settings.lesson|0));
settings.quote=Math.max(0,Math.min(3,settings.quote|0));
function save(){ db.settings={...settings};try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));}catch{} }
// Once-only design migration. Preserve history, progress and all other preferences.
try {
  if (localStorage.getItem('ritm.sage.v5') !== '1') {
    settings.theme = 'light';
    localStorage.setItem('ritm.sage.v5', '1');
    save();
  }
} catch { settings.theme = 'light'; }

const state={target:'',typed:'',charNodes:[],wordNodes:[],started:false,done:false,startTime:0,elapsed:0,keys:0,hits:0,errors:0,correctChars:0,weak:{},samples:[],lastSampleAt:0,lastSampleCorrect:0,timerId:0,focus:false,finishedRecord:null};
const input=$('#typing-input'),surface=$('#type-surface'),wordsElement=$('#typing-words'),scrollElement=$('#type-scroll');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Soft, non-blocking ambient feedback for focus mode only.
// No input data is sent outside the device; animations never affect timing/WPM.
const feedbackLayers = {
  success: $('#focus-feedback-success'),
  error: $('#focus-feedback-error'),
  urgency: $('#focus-urgency')
};
let lastGoodFlash = 0;
function focusFlash(correct) {
  if (!document.body.classList.contains('focus-on') || reducedMotion.matches) return;
  const layer = correct ? feedbackLayers.success : feedbackLayers.error;
  if (!layer) return;
  const now = performance.now();
  if (correct && now-lastGoodFlash < 105) return;
  if (correct) lastGoodFlash = now;
  layer.getAnimations().forEach(a => a.cancel());
  layer.animate([{opacity:correct ? .16 : .32},{opacity:0}], {
    duration:correct ? 470 : 690, easing:'cubic-bezier(.16,.9,.3,1)'
  });
}
function setFocusPressure(elapsed = state.elapsed) {
  if (!feedbackLayers.urgency) return;
  const active = document.body.classList.contains('focus-on') &&
    settings.mode === 'time' && state.started && !state.done;
  const remain = active ? Math.max(0, settings.seconds - elapsed) : Infinity;
  const windowSeconds = Math.min(12, settings.seconds * .5);
  const intensity = remain <= windowSeconds ? Math.pow(1 - remain/windowSeconds, 1.5) * .72 : 0;
  feedbackLayers.urgency.style.opacity = intensity.toFixed(3);
  document.body.classList.toggle('focus-time-critical', active && remain <= 8);
}
function clearFocusFeedback() {
  for (const layer of [feedbackLayers.success,feedbackLayers.error])
    layer?.getAnimations().forEach(animation=>animation.cancel());
  if(feedbackLayers.urgency) feedbackLayers.urgency.style.opacity='0';
  document.body.classList.remove('focus-time-critical');
}

let activeLineTop = null;
const successTarget=95;
let toastTimeout=0, audioContext=null;
function showToast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),2800);}
function timeNow(){return performance.now();}
function choose(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffledWords(lang,count,punctuation=false,numbers=false,focusKeys=[]){
  const bank=lang==='ru'? RU:EN;
  const focusBank=focusKeys.length?bank.filter(w=>focusKeys.some(k=>w.toLowerCase().includes(k))):[];
  const out=[];
  for(let i=0;i<count;i++){
    let word=(focusBank.length && Math.random()<.72) ? choose(focusBank) :choose(bank);
    if(numbers&&i>4&&i%11===0) word=String(10+Math.floor(Math.random()*9890));
    if(punctuation&&i>4){
      if(i%17===0)word=word+'.';
      else if(i%11===0)word=word+',';
      if(i%17===1)word=word[0].toUpperCase()+word.slice(1);
    }
    out.push(word);
  }
  return out.join(' ');
}
function makeText(){
  if(settings.mode==='lesson')return LESSONS[settings.lesson][settings.lang];
  if(settings.mode==='quote')return QUOTES[settings.lang][settings.quote];
  if(settings.mode==='weak')return shuffledWords(settings.lang,settings.weakCount,settings.punctuation,settings.numbers,topWeak(settings.lang,5).map(v=>v[0]));
  return shuffledWords(settings.lang,settings.mode==='time'?Math.max(180,settings.seconds*4):settings.wordCount,settings.punctuation,settings.numbers);
}
function topWeak(lang=settings.lang,limit=5){
  const recent=db.history.filter(r=>r.lang===lang).slice(-25);
  const scores={};
  for(let i=0;i<recent.length;i++){
    const age=recent.length-1-i,weight=Math.pow(.93,age);
    for(const [key,count] of Object.entries(recent[i].weak||{})){
      if(!/[a-zа-яё]/i.test(key) || typeof count!=='number')continue;
      scores[key]=(scores[key]||0)+count*weight;
    }
  }
  return Object.entries(scores).filter(([,v])=>v>.05).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([k,v])=>[k,Math.max(1,Math.round(v))]);
}
function buildWords(text, append=false){
  if(!append){wordsElement.replaceChildren();state.charNodes=[];state.wordNodes=[];}
  const fragment=document.createDocumentFragment();
  const groups=text.split(' ');
  for(let wi=0;wi<groups.length;wi++){
    const word=document.createElement('span');word.className='type-word';
    for(const ch of groups[wi]){
      const el=document.createElement('span');el.className='type-char';el.textContent=ch;
      word.appendChild(el);state.charNodes.push(el);
    }
    fragment.appendChild(word);state.wordNodes.push(word);
    if(wi<groups.length-1){const space=document.createElement('span');space.className='type-char space';space.textContent='\u00a0';fragment.appendChild(space);state.charNodes.push(space);}
  }
  wordsElement.appendChild(fragment);
}
function resetSession(focus=false){
  clearInterval(state.timerId);state.timerId=0;
  Object.assign(state,{typed:'',started:false,done:false,startTime:0,elapsed:0,keys:0,hits:0,errors:0,correctChars:0,weak:{},samples:[],lastSampleAt:0,lastSampleCorrect:0,finishedRecord:null});
  state.target=makeText();
  // NBSP is visual only; target contains normal ASCII spaces.
  buildWords(state.target);
  if(state.charNodes[0])state.charNodes[0].classList.add('current');
  input.disabled=false;input.value='';input.blur();
  $('#live-wpm').textContent='0';$('#live-accuracy').textContent='100';
  $('#live-timer').textContent=settings.mode==='time'?settings.seconds:'0';
  $('#timer-label').textContent=settings.mode==='time'?'ОСТАЛОСЬ':'ПРОШЛО';
  $('#run-progress').style.width='0%';$('#run-state-label').textContent='ГОТОВ К СТАРТУ';
  $('#run-area').classList.remove('is-running');
  clearFocusFeedback();
  activeLineTop = null;
  scrollElement.scrollTop = 0;
  syncActiveLine(false);
  $('#focus-hint').style.opacity='';
  updateNextKey();refreshCoach();
  if(focus){input.focus({preventScroll:true});surface.scrollIntoView({block:'center',behavior:'smooth'});}
}
function getElapsed(){if(!state.started)return 0;return Math.max(0,(timeNow()-state.startTime)/1000);}
function currentCorrectCount(value=state.typed){let correct=0;for(let i=0;i<value.length&&i<state.target.length;i++)if(value[i]===state.target[i])correct++;return correct;}
function getWpm(correct,secs){return secs>0? Math.round((correct/5)/(secs/60)):0;}
function accuracy(){return state.keys?Math.round(state.hits/state.keys*100):100;}
function startSession(){if(state.started||state.done)return;state.started=true;state.startTime=timeNow();state.lastSampleAt=0;state.lastSampleCorrect=0;$('#run-area').classList.add('is-running');$('#run-state-label').textContent='ИДЁТ ТРЕНИРОВКА';state.timerId=setInterval(updateClock,125);}
function sampleAt(elapsed, force=false){
  const second=Math.floor(elapsed);
  if(second<=state.lastSampleAt&&!force)return;
  if(!force&&second<1)return;
  const interval=Math.max(.35,elapsed-state.lastSampleAt);
  const correct=state.correctChars;
  const local=getWpm(Math.max(0,correct-state.lastSampleCorrect),interval);
  state.samples.push({t:Math.round(elapsed*10)/10,wpm:getWpm(correct,elapsed),instant:local});
  state.lastSampleAt=elapsed;state.lastSampleCorrect=correct;
}
function updateClock(){if(!state.started||state.done)return;const elapsed=getElapsed();state.elapsed=elapsed;
  if(settings.mode==='time'&&elapsed>=settings.seconds){finishSession(settings.seconds);return;}
  sampleAt(elapsed);
  updateLive(elapsed);
  setFocusPressure(elapsed);
}
function updateLive(elapsed=getElapsed()){
  $('#live-wpm').textContent=state.started?getWpm(state.correctChars,Math.max(elapsed,.25)):'0';
  $('#live-accuracy').textContent=accuracy();
  $('#live-timer').textContent=String(settings.mode==='time'?Math.max(0,Math.ceil(settings.seconds-elapsed)):Math.floor(elapsed));
  const progress=settings.mode==='time'?100*elapsed/settings.seconds:100*state.typed.length/Math.max(1,state.target.length);
  $('#run-progress').style.width=Math.max(0,Math.min(100,progress))+'%';
}
function playTap(error=false){if(!settings.sound)return;try{
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  audioContext ||= new Ctx();if(audioContext.state==='suspended')audioContext.resume();
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
  oscillator.type=error?'triangle':'sine';oscillator.frequency.setValueAtTime(error?190:480+(Math.random()*80),now);
  gain.gain.setValueAtTime(error?.045:.025,now);gain.gain.exponentialRampToValueAtTime(.001,now+.055);
  oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+.058);
} catch{}}
function refreshCaretAndLetters(prev){
  const oldLen=prev.length,newLen=state.typed.length;
  let prefix=0;while(prefix<Math.min(oldLen,newLen)&&prev[prefix]===state.typed[prefix])prefix++;
  for(let i=prefix;i<Math.max(oldLen,newLen)&&i<state.charNodes.length;i++){
    const el=state.charNodes[i];el.classList.remove('correct','incorrect');
    if(i<newLen)el.classList.add(state.typed[i]===state.target[i]?'correct':'incorrect');
  }
  if(state.charNodes[oldLen])state.charNodes[oldLen].classList.remove('current');
  if(state.charNodes[newLen])state.charNodes[newLen].classList.add('current');
  // The first word of the next rendered row takes over at the top immediately.
  // Only scroll when the active *row* changes, not on every keystroke.
  syncActiveLine(true);
}

function syncActiveLine(animate = true) {
  const index = Math.min(state.typed.length, state.charNodes.length - 1);
  const node = state.charNodes[index];
  if (!node) return;
  // A pending space belongs to the previous word: don't jump a row early.
  const activeWord = node.closest('.type-word') ||
    state.charNodes[Math.max(0, index - 1)]?.closest('.type-word');
  if (!activeWord) return;
  // The word is unbreakable. Its offset from the beginning of the text
  // stays constant while the viewport scrolls, even through animation.
  const top = Math.round(activeWord.getBoundingClientRect().top - wordsElement.getBoundingClientRect().top);
  if (activeLineTop !== null && Math.abs(top - activeLineTop) < 2) return;
  activeLineTop = top;
  scrollElement.scrollTo({top: Math.max(0, top), behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant'});
}

// Responsive reflow can change where the text wraps (mobile, zoom, resize).
// Re-align the current row without advancing or changing test statistics.
let lineResizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(lineResizeFrame);
  lineResizeFrame = requestAnimationFrame(() => {
    activeLineTop = null;
    syncActiveLine(false);
  });
}, {passive:true});
// Webfonts may finish loading after the initial layout and rewrap the words.
// Preserve the current row if that happens in the middle of a session.
document.fonts?.ready.then(() => {
  activeLineTop = null;
  syncActiveLine(false);
});
function handleTextInput(){
  if(state.done)return;
  let next=input.value.replace(/[\r\n]/g,' ');
  if(next.length>state.target.length){next=next.slice(0,state.target.length);input.value=next;}
  const previous=state.typed;
  if(next===previous)return;
  let prefix=0;while(prefix<Math.min(previous.length,next.length)&&previous[prefix]===next[prefix])prefix++;
  // Only inserted/replaced positions are new keystrokes; deleting doesn't undo mistakes.
  if(next.length>=previous.length || (next.length>prefix)){
    // The native input is append-oriented; if selection replacement occurs, count only changed characters.
    for(let i=prefix;i<next.length;i++){
      if(previous[i]===next[i] && next.length===previous.length)continue;
      const expected=state.target[i];const isCorrect=next[i]===expected;
      state.keys++;
      if(isCorrect)state.hits++;
      else {state.errors++;if(expected){const key=expected.toLowerCase();state.weak[key]=(state.weak[key]||0)+1;}}
      playTap(!isCorrect);
      focusFlash(isCorrect);
    }
  }
  state.typed=next;
  if(!state.started&&state.typed.length>0)startSession();
  state.correctChars=currentCorrectCount();
  refreshCaretAndLetters(previous);
  updateNextKey();
  if(settings.mode==='time'&&state.typed.length>state.target.length-100){
    const extra=shuffledWords(settings.lang,100,settings.punctuation,settings.numbers);
    state.target+=' '+extra;
    // Append as distinct words prefixed by space. The DOM stays aligned with target indexes.
    const s=document.createElement('span');s.className='type-char space';s.textContent='\u00a0';wordsElement.appendChild(s);state.charNodes.push(s);
    buildWords(extra,true);
  }
  if(state.started)updateLive();
  if(settings.mode!=='time'&&state.typed.length>=state.target.length){finishSession();}
}
input.addEventListener('beforeinput',event=>{
  if(state.done){event.preventDefault();return;}
  if(['insertFromPaste','insertFromDrop','insertLineBreak','insertParagraph'].includes(event.inputType)){event.preventDefault();showToast('Чтобы тренировка была честной, печатай самостоятельно');}
});
input.addEventListener('paste',event=>{event.preventDefault();showToast('Вставка отключена — тренируем настоящую печать');});
input.addEventListener('drop',event=>event.preventDefault());
let compositionActive=false;
input.addEventListener('compositionstart',()=>{compositionActive=true;});
input.addEventListener('compositionend',()=>{compositionActive=false;handleTextInput();});
input.addEventListener('input',event=>{if(event.isComposing||compositionActive)return;handleTextInput();});
input.addEventListener('focus',()=>{$('#focus-hint').style.opacity='0';});
input.addEventListener('blur',()=>{$('#focus-hint').style.opacity=state.done?'0':'1';});
// Visual keyboard and finger hint.
function buildKeyboard(){
  const wrap=$('#keyboard');wrap.replaceChildren();
  for(let row=0;row<3;row++){
    const line=document.createElement('div');line.className='key-row';
    [...keyboardRows[settings.lang][row]].forEach((ch,i,arr)=>{
      const key=document.createElement('span');const isLeft=i < (row===0?5:row===1?5:5);
      key.className='key '+(isLeft?'hand-left':'hand-right');if(HOME[settings.lang].includes(ch))key.classList.add('home-key');
      key.textContent=ch.toUpperCase();key.dataset.char=ch;line.appendChild(key);
    });
    wrap.appendChild(line);
  }
  const row=document.createElement('div');row.className='key-row';const space=document.createElement('span');space.className='key spacebar';space.textContent='ПРОБЕЛ';space.dataset.char=' ';row.appendChild(space);wrap.appendChild(row);
}
function updateNextKey(){
  const current=state.target[state.typed.length]||'';
  $('#next-key').textContent=current===' '?'␣':(current?current.toUpperCase():'—');
  $$('.key.key-active').forEach(el=>el.classList.remove('key-active'));
  const el=$$('.key').find(x=>x.dataset.char===current.toLowerCase());if(el)el.classList.add('key-active');
  const base=settings.lang==='ru'?'А и О (физически F и J)':'F and J';
  const lower=current.toLowerCase();
  let text='Положи указательные пальцы на '+base+'.';
  if(current===' ')text='Пробел — нажми большим пальцем любой руки.';
  else if(current){
    let location=null;
    const mapping=['мизинец','безымянный','средний','указательный','указательный','указательный','указательный','средний','безымянный','мизинец','мизинец','мизинец'];
    for (const row of keyboardRows[settings.lang]){
      const i=row.indexOf(lower);
      if(i<0)continue;
      const left=i<5;
      const mapped=left?i:(i===5||i===6?i:i===7?7:i===8?8:9);
      location=`${left?'Левая':'Правая'} рука · ${mapping[mapped]} палец`;
      break;
    }
    if(location)text=`${current.toUpperCase()} — ${location.toLowerCase()}.${current!==lower?' Добавь Shift другой рукой.':''}`;
    else text=`Следующая клавиша: ${current.toUpperCase()}. Держи руки на опорном ряду.`;
  }
  $('#finger-hint').textContent=text;
}
function switchMode(mode){
  if(!['time','words','lesson','quote','weak'].includes(mode))return;
  settings.mode=mode;
  if(mode==='lesson'&&!db.completed[settings.lang].includes(settings.lesson)){
    const first=LESSONS.findIndex((_,i)=>!db.completed[settings.lang].includes(i));if(first>=0)settings.lesson=first;
  }
  save();renderControls();resetSession();
}
function setLanguage(lang){if(!['ru','en'].includes(lang)||lang===settings.lang)return;settings.lang=lang;if(settings.mode==='lesson'){
    const first=LESSONS.findIndex((_,i)=>!db.completed[lang].includes(i));settings.lesson=first<0?7:first;
  }save();renderControls();buildKeyboard();renderLessons();renderWeakKeys();resetSession();}
function renderControls(){
  $$('.mode-tab').forEach(btn=>{const active=btn.dataset.mode===settings.mode;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));});
  $$('.lang-btn').forEach(btn=>{const active=btn.dataset.lang===settings.lang;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
  $('#punctuation-toggle').checked=settings.punctuation;$('#numbers-toggle').checked=settings.numbers;
  const choices=settings.mode==='time'?[15,30,60,120]:settings.mode==='words'?[25,50,100]:settings.mode==='weak'?[25,50,100]:settings.mode==='quote'?[0,1,2,3]:[0,1,2,3,4,5,6,7];
  const label={time:'ДЛИТЕЛЬНОСТЬ',words:'КОЛИЧЕСТВО',lesson:'НОМЕР УРОКА',quote:'ВАРИАНТ ТЕКСТА',weak:'КОЛИЧЕСТВО'}[settings.mode];
  const unit={time:'сек',words:'слов',lesson:'из 8',quote:'',weak:'слов'}[settings.mode];
  const selected={time:settings.seconds,words:settings.wordCount,lesson:settings.lesson,quote:settings.quote,weak:settings.weakCount}[settings.mode];
  $('#option-label').textContent=label;$('#option-unit').textContent=unit;
  const wrap=$('#option-buttons');wrap.replaceChildren();
  choices.forEach(v=>{const button=document.createElement('button');button.type='button';button.className='option'+(selected===v?' active':'');button.dataset.value=String(v);button.textContent=settings.mode==='lesson'?String(v+1).padStart(2,'0'):settings.mode==='quote'?String(v+1).padStart(2,'0'):String(v);
    if(settings.mode==='lesson'&&v>0&&!db.completed[settings.lang].includes(v-1)){button.disabled=true;button.title='Заверши предыдущий урок с точностью 95%';}
    wrap.appendChild(button);
  });
  const boolAllowed=['time','words','weak'].includes(settings.mode);
  $$('#punctuation-toggle, #numbers-toggle').forEach(el=>{el.disabled=!boolAllowed;el.closest('label').style.opacity=boolAllowed?'1':'.38';});
  $('#sound-toggle').setAttribute('aria-pressed',String(settings.sound));
  $('#sound-toggle span').textContent=settings.sound?'Звук вкл.':'Звук выкл.';
}
$('#mode-tabs').addEventListener('click',event=>{const btn=event.target.closest('button[data-mode]');if(btn)switchMode(btn.dataset.mode);});
$$('.lang-btn').forEach(btn=>btn.addEventListener('click',()=>setLanguage(btn.dataset.lang)));
$('#option-buttons').addEventListener('click',event=>{const btn=event.target.closest('button[data-value]');if(!btn||btn.disabled)return;
 const v=Number(btn.dataset.value);if(settings.mode==='time')settings.seconds=v;else if(settings.mode==='words')settings.wordCount=v;else if(settings.mode==='weak')settings.weakCount=v;else if(settings.mode==='lesson')settings.lesson=v;else if(settings.mode==='quote')settings.quote=v;
 save();renderControls();resetSession();});
[['punctuation-toggle','punctuation'],['numbers-toggle','numbers']].forEach(([id,key])=>{$('#'+id).addEventListener('change',event=>{settings[key]=event.target.checked;save();resetSession();});});
$('#sound-toggle').addEventListener('click',()=>{settings.sound=!settings.sound;save();renderControls();showToast(settings.sound?'Звуки клавиш включены':'Звуки клавиш выключены');});
$('#focus-toggle').addEventListener('click',()=>{document.body.classList.toggle('focus-on');const yes=document.body.classList.contains('focus-on');$('#focus-toggle').setAttribute('aria-pressed',String(yes));if(!yes)clearFocusFeedback();else setFocusPressure(getElapsed());input.focus({preventScroll:true});});
$('#theme-toggle').addEventListener('click',()=>{settings.theme=settings.theme==='light'?'dark':'light';document.body.classList.toggle('light-theme',settings.theme==='light');save();});
$('#restart-button').addEventListener('click',()=>resetSession(true));
let armedTab=false;
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(!$('#result-dialog').open){input.blur();if(document.body.classList.contains('focus-on')){$('#focus-toggle').click();input.blur();}}armedTab=false;return;}
  if(event.key==='Tab'&&!event.shiftKey&&document.activeElement===input){armedTab=true;return;}
  if(armedTab&&event.key==='Enter'){event.preventDefault();armedTab=false;resetSession(true);return;}
  if(event.key!=='Tab')armedTab=false;
});
// Render course cards, unlocked sequentially and based on measured accuracy.
function renderLessons(){const wrap=$('#lesson-grid');wrap.replaceChildren();
  LESSONS.forEach((lesson,i)=>{
    const done=db.completed[settings.lang].includes(i);const unlocked=i===0||db.completed[settings.lang].includes(i-1);
    const button=document.createElement('button');button.type='button';button.className='lesson-card'+(!unlocked?' locked':'');
    button.setAttribute('aria-label',`${lesson.title}. ${done?'Пройдено':unlocked?'Начать':'Заблокировано'}`);
    const head=document.createElement('div');head.className='lesson-card-head';head.innerHTML=`<span>УРОК ${String(i+1).padStart(2,'0')}</span><b>${done?'✓':unlocked?'↗':'⌑'}</b>`;
    const title=document.createElement('h3');title.textContent=lesson.title;const desc=document.createElement('p');desc.textContent=lesson.description;
    const foot=document.createElement('div');foot.className='lesson-card-foot';const status=document.createElement('span');status.textContent=done?'ПРОЙДЕН':unlocked?'НАЧАТЬ УРОК':'ОТКРОЕТСЯ ПОЗЖЕ';const icon=document.createElement('strong');icon.textContent=done?'★':unlocked?'→':'·';foot.append(status,icon);
    button.append(head,title,desc,foot);button.disabled=!unlocked;
    button.addEventListener('click',()=>{settings.lesson=i;settings.mode='lesson';save();renderControls();resetSession();$('#trainer').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{input.focus({preventScroll:true});},400);});wrap.appendChild(button);
  });
}
function refreshCoach(){
  const title=$('#coach-title'),text=$('#coach-text'),tag=$('#coach-tag');
  if(settings.mode==='lesson'){title.textContent=LESSONS[settings.lesson].title; text.textContent=LESSONS[settings.lesson].description+' Заверши с точностью от 95%, чтобы открыть следующий урок.';tag.textContent='ЗАДАЧА: ТОЧНОСТЬ ≥ 95%';}
  else if(settings.mode==='weak'){const weak=topWeak(settings.lang);title.textContent=weak.length?'Тренируем слабое место.':'Сделаем базу сильнее.';text.textContent=weak.length?'Подбираем слова, в которых чаще встречаются твои сложные клавиши: '+weak.map(x=>x[0].toUpperCase()).join(', ')+'.':'Сначала пройди несколько тестов. После ошибок здесь появится адаптивная тренировка.';tag.textContent='АДАПТИВНАЯ ПРАКТИКА';}
  else if(settings.mode==='quote'){title.textContent='Печатай как в жизни.';text.textContent='Связный текст развивает переходы между словами, пунктуацию и ровный темп — не только частые короткие слова.';tag.textContent='ТЕКСТ БЕЗ СПЕШКИ';}
  else {title.textContent='Сначала точно. Потом быстро.';text.textContent='Не гонись за цифрами. Сначала добейся 95% точности — скорость придёт с практикой.';tag.textContent='ЦЕЛЬ: 95% ТОЧНОСТИ';}
}
function sessionConsistency(){const samples=state.samples.map(s=>s.instant).filter(v=>Number.isFinite(v));if(samples.length<3)return null;
  const mean=samples.reduce((a,b)=>a+b,0)/samples.length;if(mean<1)return 0;
  const sd=Math.sqrt(samples.reduce((a,b)=>a+(b-mean)**2,0)/samples.length);return Math.max(0,Math.min(100,Math.round(100*(1-sd/mean))));
}
function finishSession(durationOverride=null){
  if(state.done||!state.started)return;
  state.elapsed=durationOverride??getElapsed();state.done=true;clearInterval(state.timerId);state.timerId=0;sampleAt(state.elapsed,true);
  updateLive(state.elapsed);$('#run-progress').style.width='100%';$('#run-state-label').textContent='ЗАВЕРШЕНО';$('#run-area').classList.remove('is-running');
  const duration=Math.max(.25,state.elapsed),wpm=getWpm(state.correctChars,duration),raw=getWpm(state.keys,duration),acc=accuracy(),consistency=sessionConsistency();
  const record={id:Date.now()+Math.random(),date:new Date().toISOString(),day:localDay(),mode:settings.mode,lang:settings.lang,wpm,raw,accuracy:acc,duration:Math.round(duration*10)/10,keystrokes:state.keys,errors:state.errors,correct:state.correctChars,consistency,samples:state.samples.slice(-130),weak:{...state.weak},lesson:settings.mode==='lesson'?settings.lesson:null};
  state.finishedRecord=record;db.history.push(record);db.history=db.history.slice(-150);
  for(const [key,count] of Object.entries(state.weak)){if(!/[a-zа-яё]/i.test(key))continue;const obj=db.mistakes[settings.lang];obj[key]=Math.min(999,(Number(obj[key])||0)+count);}
  let passed=false;
  if(settings.mode==='lesson'&&acc>=successTarget){passed=true;const arr=db.completed[settings.lang];if(!arr.includes(settings.lesson))arr.push(settings.lesson);}
  save();renderControls();renderLessons();renderProgress();renderResult(record,passed);
  clearFocusFeedback();
  input.blur();input.disabled=true;$('#result-dialog').showModal();
}
function eligibleRecords(){return db.history.filter(r=>['time','words','quote'].includes(r.mode)&&r.duration>=5&&r.correct>=20&&Number.isFinite(r.wpm));}
function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function streakDays(){const days=new Set(db.history.map(x=>x.day).filter(Boolean));let current=new Date();if(!days.has(localDay(current)))current.setDate(current.getDate()-1);
  let count=0;while(days.has(localDay(current))&&count<1000){count++;current.setDate(current.getDate()-1);}return count;
}
function svgChart(data,{small=false,result=false}={}){
  if(!data.length)return '<div class="chart-empty">Здесь появится график после первой тренировки ✳</div>';
  const w=600,h=small?90:result?160:210,pt=small?8:20,plotBottom=h-(small?6:26),plotTop=10;
  const values=data.map(Number).map(v=>Math.max(0,v||0));const max=Math.max(20,Math.ceil(Math.max(...values)*1.2/10)*10);
  const coords=values.map((v,i)=>[pt+(values.length===1?.5:i/(values.length-1))*(w-pt*2),plotBottom-(v/max)*(plotBottom-plotTop)]);
  const line=coords.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area=line+` L${coords.at(-1)[0]},${plotBottom} L${coords[0][0]},${plotBottom} Z`;
  const grid=small?'':[0,.5,1].map(n=>`<line x1="${pt}" x2="${w-pt}" y1="${(plotTop+(plotBottom-plotTop)*n).toFixed(2)}" y2="${(plotTop+(plotBottom-plotTop)*n).toFixed(2)}" stroke="currentColor" opacity=".13" stroke-dasharray="3 7"/>`).join('');
  const labels=small?'':`<text x="${pt}" y="${h-5}" fill="currentColor" opacity=".5" font-size="10">${result?'старт':'первая'}</text><text x="${w-pt}" y="${h-5}" text-anchor="end" fill="currentColor" opacity=".5" font-size="10">${result?'финиш':'последняя'}</text><text x="${w-pt}" y="${plotTop+4}" text-anchor="end" fill="currentColor" opacity=".5" font-size="10">${max} WPM</text>`;
  const points=small?'':`<circle cx="${coords.at(-1)[0]}" cy="${coords.at(-1)[1]}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="График скорости печати"><defs><linearGradient id="gradient-${small?'small':result?'result':'history'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".27"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#gradient-${small?'small':result?'result':'history'})"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="${small?2.8:3.2}" stroke-linecap="round" stroke-linejoin="round"/>${points}${labels}</svg>`;
}
function renderProgress(){
  const rec=eligibleRecords(),all=db.history,avg=arr=>arr.length?Math.round(arr.reduce((s,r)=>s+r.wpm,0)/arr.length):null;
  const best=rec.length?Math.max(...rec.map(r=>r.wpm)):null;
  const average=avg(rec),acc=all.length?Math.round(all.reduce((s,r)=>s+r.accuracy,0)/all.length):null;
  const time=all.reduce((s,r)=>s+Math.max(0,r.duration||0),0);
  $('#hero-best').textContent=best??'—';$('#header-streak').textContent=streakDays();
  $('#aside-sessions').textContent=String(all.length);$('#aside-avg').textContent=average??'—';
  $('#stat-best').textContent=best??'—';$('#stat-average').textContent=average??'—';$('#stat-accuracy').textContent=acc??'—';$('#stat-time').textContent=Math.round(time/60);
  $('#tiny-chart').innerHTML=svgChart(rec.slice(-10).map(r=>r.wpm),{small:true});
  $('#history-chart').innerHTML=svgChart(rec.slice(-24).map(r=>r.wpm));
  const last=rec.slice(-2);$('#aside-trend').textContent=last.length<2?'Начни первый тест':(last[1].wpm>=last[0].wpm?'↗ +':'↘ ')+Math.abs(last[1].wpm-last[0].wpm)+' WPM';
  renderWeakKeys();
}
function renderWeakKeys(){const wrap=$('#weak-keys'),list=topWeak(settings.lang,5);wrap.replaceChildren();if(!list.length){const el=document.createElement('span');el.className='empty-weak';el.textContent='Пока ошибок нет. Так держать!';wrap.appendChild(el);return;}
  for(const [key,count] of list){const el=document.createElement('div');el.className='weak-key';const symbol=document.createElement('span');symbol.textContent=key.toUpperCase();const sub=document.createElement('small');sub.textContent=count+' ошиб.';el.append(symbol,sub);wrap.appendChild(el);}
}
function renderResult(r,passed){
  const first=!eligibleRecords().some(x=>x.id!==r.id);
  $('#result-subtitle').textContent=passed?'УРОК ПРОЙДЕН ✓':r.mode==='lesson'?'НУЖНО ЕЩЁ НЕМНОГО ПРАКТИКИ':'ЗАВЕРШЕНО / СЛЕДУЮЩИЙ ШАГ';
  $('#result-title').innerHTML=passed?'Новый навык открыт<span>.</span>':r.accuracy>=98?'Очень чистый набор<span>.</span>':r.accuracy>=95?'Хороший ритм<span>.</span>':'Каждая ошибка учит<span>.</span>';
  $('#result-feedback').textContent=passed?'Отличная точность! Следующий урок разблокирован.':r.mode==='lesson'?'Для перехода к следующему уроку нужна точность 95%. Повтори спокойно.':r.accuracy>=95?'Хорошая точность. Теперь попробуй держать такой темп стабильно.':'Не спеши. Сфокусируйся на клавишах, которые вызывают затруднение.';
  $('#result-wpm').textContent=r.wpm;$('#result-accuracy').textContent=r.accuracy+'%';$('#result-raw').textContent=r.raw;
  $('#result-consistency').textContent=r.consistency===null?'—':r.consistency+'%';
  $('#result-duration').textContent=r.duration.toFixed(1)+' c';$('#result-keystrokes').textContent=r.keystrokes;$('#result-errors').textContent=r.errors;
  const worst=Object.entries(r.weak).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]===' '?'␣':x[0].toUpperCase()).join(' · ');
  $('#result-weak').textContent=worst||'—';
  $('#result-chart').innerHTML=svgChart(r.samples.map(s=>s.wpm),{result:true});
  $('#result-practice').textContent=Object.keys(r.weak).length?'Тренировать ошибки':'Вернуться к урокам';
}
$('#result-close').addEventListener('click',()=>$('#result-dialog').close());
$('#result-retry').addEventListener('click',()=>{const last=state.finishedRecord;$('#result-dialog').close();if(last?.mode==='lesson'&&db.completed[settings.lang].includes(settings.lesson)&&settings.lesson<7){settings.lesson++;save();renderControls();}resetSession(true);});
function goWeak(){if($('#result-dialog').open)$('#result-dialog').close();switchMode('weak');$('#trainer').scrollIntoView({behavior:'smooth'});setTimeout(()=>input.focus({preventScroll:true}),250);}
$('#result-practice').addEventListener('click',()=>{if(state.finishedRecord&&Object.keys(state.finishedRecord.weak).length)goWeak();else{$('#result-dialog').close();switchMode('lesson');$('#trainer').scrollIntoView({behavior:'smooth'});}});
$('#weak-drill-button').addEventListener('click',goWeak);
$('#result-dialog').addEventListener('click',event=>{if(event.target.id==='result-dialog')$('#result-dialog').close();});
function exportCsv(){
  if(!db.history.length){showToast('Пока нечего выгружать: сначала пройди тест');return;}
  const cols=['date','mode','lang','wpm','raw','accuracy','duration','keystrokes','errors','consistency','lesson'];
  const escape=value=>'"'+String(value??'').replaceAll('"','""')+'"';
  const rows=[cols.join(','),...db.history.map(record=>cols.map(k=>escape(record[k])).join(','))];
  const csv='\uFEFF'+rows.join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='ritm-progress-'+localDay()+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  showToast('История экспортирована в CSV');
}
$('#export-csv').addEventListener('click',exportCsv);
$('#clear-history').addEventListener('click',()=>{
  if(!db.history.length && !db.completed.ru.length && !db.completed.en.length){showToast('История уже пустая');return;}
  if(!window.confirm('Удалить все результаты, ошибки и пройденные уроки на этом устройстве? Это действие нельзя отменить.'))return;
  db.history=[];db.completed={ru:[],en:[]};db.mistakes={ru:{},en:{}};settings.lesson=0;save();renderLessons();renderControls();renderProgress();resetSession();showToast('История очищена');
});
// Initialize: isolated, no network calls, works on GitHub Pages and with file://.
document.body.classList.toggle('light-theme',settings.theme==='light');
$('#year').textContent=new Date().getFullYear();$('#daily-tip').textContent=TIPS[new Date().getDay()%TIPS.length];
renderControls();buildKeyboard();renderLessons();renderProgress();resetSession();

// Keep the offline version current without clearing any local typing history.
// A versioned script URL bypasses stale service-worker script caches.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  let reloadingForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadingForUpdate) return;
    reloadingForUpdate = true;
    try {
      const key = 'ritm.updated.v5';
      if (sessionStorage.getItem(key) === 'yes') return;
      sessionStorage.setItem(key, 'yes');
    } catch { /* Private browsing may disable sessionStorage. */ }
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=5', {updateViaCache:'none'})
      .then(registration => registration.update())
      .catch(() => {});
  }, {once:true});
}
