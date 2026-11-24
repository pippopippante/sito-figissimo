// Mini Capri: una Capri piccola che gira per la pagina e dice cose a caso. Cammina sopra titoli,
// link, pulsanti e video, si arrampica da una riga all'altra, salta, vola, si siede, balla quando
// parte la clip. Si trascina e si lancia; cliccata parla.
// Animazioni e grafica di Capri (github.com/lachydotmcg/capri-desktop), licenza PolyForm
// Noncommercial 1.0.0 in capri/LICENSE-capri.md: solo uso non commerciale. Font Share Tech Mono (OFL).
// Codice di Emanuele Parmegiani
(() => {
const LINES = [
  "ciao choom che fai?",
  "choom minchia fra guarda la clip",
  "choom choom arriva il trenino",
  "choom dovresti cliccare i pulzanti curano il cancro trusta",
  "choom hai rotto il cazzo",
  "choom clicca le foto forse funzionano se non funzionao e' perche puzzi",
];
// nome, fotogrammi, fotogrammi al secondo; le strisce "perch_" sono quelle seduta (fotogrammi quadrati)
const CLIPS = {
  idle: [16, 8], blink: [4, 8], walk: [12, 12], dangle: [24, 10], glitch: [10, 15], grin: [16, 8], dance: [16, 8],
  arrive: [14, 15], leave: [12, 15], mouth: [5, 12],
  perch: [16, 8], perch_blink: [4, 8], perch_dance: [16, 8], perch_glitch: [10, 15], perch_leave: [12, 15],
};
const LPS = 28, MOUTH_RATE = 12, GRAVITY = 9, BLINK_FROM = 9;   // gravità in altezze di Capri al secondo²
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

const css = document.createElement('style');
css.textContent = `
  @font-face { font-family: 'Share Tech Mono'; src: url(capri/ShareTechMono-Regular.ttf); font-display: swap; }
  #capri { position: fixed; left: 0; top: 0; z-index: 998; pointer-events: none; will-change: transform; }
  #capri .cp-img, #capri .cp-mouth { position: absolute; background-repeat: no-repeat; }
  #capri .cp-hit { position: absolute; pointer-events: auto; cursor: grab; touch-action: none; }
  #capri.cp-drag .cp-hit { cursor: grabbing; }
  #capri-bubble {
    position: fixed; left: 0; top: 0; z-index: 998; pointer-events: none; display: none;
    font: 14px/19px 'Share Tech Mono', Consolas, monospace; filter: drop-shadow(0 0 4px rgba(58,214,235,.35));
  }
  #capri-bubble .cp-edge { background: #3ad6eb; padding: 2px;
    clip-path: polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px), 0 10px); }
  #capri-bubble .cp-panel { position: relative; background: rgba(9,11,15,.94); padding: 12px 14px 10px 24px;
    clip-path: polygon(9px 0, 100% 0, 100% 100%, 9px 100%, 0 calc(100% - 9px), 0 9px);
    background-image: repeating-linear-gradient(to bottom, rgba(255,255,255,.035) 0 1px, transparent 1px 3px); }
  #capri-bubble .cp-panel::before { content: ''; position: absolute; left: 10px; top: 13px; bottom: 13px; width: 3px; background: #e82440; }
  #capri-bubble .cp-heard { color: #7a808a; font-style: italic; }
  #capri-bubble .cp-name { color: #e82440; font-weight: bold; }
  #capri-bubble .cp-text { color: #38b0ff; overflow-wrap: anywhere; }
  #capri-bubble .cp-caret { display: inline-block; width: .55em; height: 14px; margin-left: 1px; vertical-align: -2px; background: #38b0ff; }
  #capri-bubble .cp-tail { position: absolute; width: 18px; height: 14px; background: #3ad6eb; }
  #capri-bubble .cp-tail::after { content: ''; position: absolute; inset: 0; background: rgba(9,11,15,.94); }
  #capri-bubble.cp-up .cp-tail { bottom: -12px; clip-path: polygon(0 0, 100% 0, 30% 100%); }
  #capri-bubble.cp-up .cp-tail::after { clip-path: polygon(3px 0, calc(100% - 3px) 0, 30% calc(100% - 4px)); top: -2px; }
  #capri-bubble.cp-down .cp-tail { top: -12px; clip-path: polygon(30% 0, 100% 100%, 0 100%); }
  #capri-bubble.cp-down .cp-tail::after { clip-path: polygon(30% 4px, calc(100% - 3px) 100%, 3px 100%); top: 2px; }
`;
document.head.appendChild(css);

const root = document.createElement('div'), img = document.createElement('div'), mouthEl = document.createElement('div'), hit = document.createElement('div');
root.id = 'capri'; root.setAttribute('aria-hidden', 'true');
img.className = 'cp-img'; mouthEl.className = 'cp-mouth'; hit.className = 'cp-hit';
root.append(img, mouthEl, hit);
const bubble = document.createElement('div');
bubble.id = 'capri-bubble'; bubble.setAttribute('aria-hidden', 'true');
bubble.innerHTML = '<div class="cp-edge"><div class="cp-panel"><div class="cp-heard">&gt; in giro per la pagina</div>'
  + '<div><span class="cp-name">MINI CAPRI: </span><span class="cp-text"></span><span class="cp-caret"></span></div></div></div><div class="cp-tail"></div>';
const textEl = bubble.querySelector('.cp-text'), caretEl = bubble.querySelector('.cp-caret'), tailEl = bubble.querySelector('.cp-tail');

let H;                                  // altezza in piedi, in px
const now = () => performance.now() / 1000;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// --- dove può stare: il bordo alto di testi, link, pulsanti, foto, video; e il fondo della pagina ---
const SPOTS = 'h1, h2, p, a, button, img, iframe, video, input';
function rectOf(el) {
  if (el.matches('h1, h2, p, a')) {        // sopra le parole, non sopra tutta la riga
    const r = document.createRange(); r.selectNodeContents(el);
    const b = r.getBoundingClientRect();
    if (b.width > 0) return b;
  }
  return el.getBoundingClientRect();
}
function ledgeOf(el) {
  if (el.closest('#capri, #capri-bubble') || getComputedStyle(el).visibility === 'hidden') return null;
  const b = rectOf(el);
  if (b.width < 24 || b.height < 4) return null;
  const y = b.top + scrollY;
  if (y < H * 0.9) return null;           // troppo in alto: la testa uscirebbe dalla pagina
  return { el, left: b.left + scrollX, right: b.right + scrollX, y };
}
function pageWidth() { return document.documentElement.clientWidth; }
function floor() { return { el: null, floor: true, left: 0, right: pageWidth(), y: Math.max(document.documentElement.scrollHeight, innerHeight) }; }
function ledges() {
  const out = [floor()];
  for (const el of document.querySelectorAll(SPOTS)) { const l = ledgeOf(el); if (l) out.push(l); }
  return out;
}
const visible = (l) => l.y - H > scrollY && l.y < scrollY + innerHeight - 4;

// --- stato ---
let mode = 'arrive', x = 0, y = 0, vx = 0, vy = 0, lean = 0, until = 0, left = false, sitting = false;
let ledge = null, goal = null, around = [], aroundAt = -10;
let walkTo = 0, climbX = 0, landX = 0, climbAfter = false;
let fly = null;
let once = null, onceStart = 0, base = null, baseStart = 0, lastCycle = 0, blinkOn = false;
let speech = null, speechAt = -100, nextTalk = 0, lastLine = -1, greeted = false;
let lastStep = 0, offSince = -1;
let grab = null;

const grounded = () => mode === 'idle' || mode === 'walk';
const talking = (t) => speech && t - speechAt < speech.length / LPS;
function play(name) { once = name; onceStart = now(); }
function onceDone(t) { return !once || (t - onceStart) * CLIPS[once][1] >= CLIPS[once][0]; }
function rest(seconds) { mode = 'idle'; until = now() + (seconds || rand(1.5, 5)); }

function decide() {
  sitting = false;
  const r = Math.random();
  if (calm) { sitting = r < 0.5; return rest(rand(4, 9)); }
  if (r < 0.28) { if (!walkTowards(rand(ledge.left + 10, ledge.right - 10))) rest(); }
  else if (r < 0.40) { sitting = true; rest(rand(4, 10)); }
  else if (r < 0.66) { if (!tryClimb()) flySomewhere(); }
  else if (r < 0.80) flySomewhere();
  else if (r < 0.90) jump();
  else rest();
}

// --- per terra ---
function holdLedge(t) {
  if (!ledge) return startFall(0, 0);
  const l = ledge.floor ? floor() : ledgeOf(ledge.el);
  if (!l || !document.contains(ledge.el || document.body)) return drop();
  // l'elemento si è spostato (foto caricata, finestra più stretta...): lei va con lui
  if (l.left !== ledge.left || l.y !== ledge.y || l.right !== ledge.right) {
    const dx = Math.abs((l.right - l.left) - (ledge.right - ledge.left)) < 1 ? l.left - ledge.left : 0;
    x = clamp(x + dx, l.left + 8, l.right - 8); walkTo += dx; y = l.y;
    Object.assign(ledge, l);
  }
}
function walkTowards(target) {
  target = clamp(target, ledge.left + 8, ledge.right - 8);
  if (Math.abs(target - x) < 20) return false;
  walkTo = target; left = target < x; sitting = false; mode = 'walk';
  if (once === 'grin') once = null;       // se no scivola sorridendo invece di camminare
  return true;
}
function walk(dt) {
  const step = H * 0.55 * dt;
  if (Math.abs(walkTo - x) <= step) { x = walkTo; return climbAfter ? startClimb() : rest(); }
  x += walkTo > x ? step : -step; left = walkTo < x;
}
function jump() {
  const way = Math.random() < 0.5 ? -1 : 1;
  left = way < 0;
  startFall(way * H * rand(0.8, 1.6), -H * rand(3.6, 4.8));
}

// --- arrampicarsi sul lato di una riga più in alto ---
function tryClimb() {
  const ways = [];
  for (const l of fresh()) {
    if (l.floor || l.el === ledge.el || l.y > y - H * 0.4 || l.y < y - H * 3.5 || !visible(l)) continue;
    for (const [side, land] of [[l.left - 4, l.left + 12], [l.right + 4, l.right - 12]])
      if (side >= ledge.left - 40 && side <= ledge.right + 40 && side > 10 && side < pageWidth() - 10) ways.push([l, side, land]);
  }
  if (!ways.length) return false;
  [goal, climbX, landX] = ways[Math.floor(Math.random() * ways.length)];
  climbAfter = true;
  if (!walkTowards(climbX)) startClimb();
  return true;
}
function startClimb() {
  climbAfter = false; sitting = false; left = landX < climbX; mode = 'climb';
}
function climb(dt, t) {
  const l = ledgeOf(goal.el);
  if (!l) return startFall(0, 0);
  if (l.left !== goal.left || l.y !== goal.y) {      // la riga si è spostata: segue il lato
    const fromLeft = climbX < (goal.left + goal.right) / 2;
    climbX = fromLeft ? l.left - 4 : l.right + 4; landX = fromLeft ? l.left + 12 : l.right - 12;
    Object.assign(goal, l);
  }
  x += (climbX - x) * Math.min(1, dt * 10);
  lean = Math.sin(t * 9) * 5;
  y -= H * 0.6 * dt;
  if (y <= goal.y) land(goal, landX);
}

// --- volare ---
function flySomewhere() {
  const all = fresh().filter(l => l.right - l.left >= 40 && visible(l));
  const others = all.filter(l => !l.floor && (!ledge || l.el !== ledge.el));
  const pool = others.length && Math.random() < 0.75 ? others : all;
  if (!pool.length) return rest();
  goal = pool[Math.floor(Math.random() * pool.length)];
  const from = { x, y }, to = { x: rand(goal.left + 14, Math.max(goal.left + 14, goal.right - 14)), y: goal.y };
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const via = { x: (from.x + to.x) / 2, y: Math.max(scrollY + H * 1.2, Math.min(from.y, to.y) - H * 1.2 - dist * 0.15) };
  fly = { from, to, via, start: now(), time: Math.max(1.2, dist / (H * 3)) };
  left = to.x < from.x; sitting = false; climbAfter = false; ledge = null;
  play('glitch');
  mode = 'fly';
}
function flying(t) {
  const u = Math.min(1, (t - fly.start) / fly.time);
  const e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
  const a = (1 - e) ** 2, b = 2 * (1 - e) * e, c = e * e;
  x = a * fly.from.x + b * fly.via.x + c * fly.to.x;
  y = a * fly.from.y + b * fly.via.y + c * fly.to.y + Math.sin(t * 6) * H * 0.04 * (1 - u);
  lean = (left ? -12 : 12) * Math.sin(Math.PI * u);
  if (u < 1) return;
  const l = goal.floor ? floor() : ledgeOf(goal.el);
  if (!l) return startFall(0, 0);
  land(l, fly.to.x);
}

// --- cadere ---
function drop() { sitting = false; play('glitch'); startFall(0, 0); }
function startFall(svx, svy) {
  vx = svx; vy = svy; ledge = null; climbAfter = false; sitting = false; mode = 'fall'; fresh();
}
function fresh() { around = ledges(); aroundAt = now(); return around; }
function fall(dt, t) {
  vy = Math.min(vy + GRAVITY * H * dt, 30 * H);
  let nx = x + vx * dt; const ny = y + vy * dt;
  const w = pageWidth();
  if (nx < H * 0.3 || nx > w - H * 0.3) { vx = -vx * 0.5; nx = clamp(nx, H * 0.3, w - H * 0.3); }
  if (vy > 0) {
    if (t - aroundAt > 0.4) fresh();
    let best = null;
    for (const l of around) if (l.y >= y - 1 && l.y <= ny && nx >= l.left && nx <= l.right && (!best || l.y < best.y)) best = l;
    if (!best && ny > floor().y) best = floor();
    if (best) return land(best, nx);
  }
  x = nx; y = ny;
  lean = clamp(vx / H * 4, -15, 15);
}
function land(l, at) {
  ledge = { ...l }; y = l.y; x = clamp(at, l.left + 8, l.right - 8); vx = vy = 0;
  if (Math.random() < 0.4) play('grin');
  rest(rand(0.8, 2.3));
}

// --- trascinarla e lanciarla; cliccata parla ---
hit.addEventListener('pointerdown', (e) => {
  if (mode === 'arrive' || mode === 'leave' || e.button !== 0) return;
  hit.setPointerCapture(e.pointerId);
  grab = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: x - (e.clientX + scrollX), oy: y - (e.clientY + scrollY), px: e.clientX, py: e.clientY, pt: now(), vx: 0, vy: 0, moved: false };
  e.preventDefault();
});
hit.addEventListener('pointermove', (e) => {
  if (!grab || e.pointerId !== grab.id) return;
  const t = now(), dt = Math.max(0.001, t - grab.pt);
  grab.vx = grab.vx * 0.5 + (e.clientX - grab.px) / dt * 0.5; grab.vy = grab.vy * 0.5 + (e.clientY - grab.py) / dt * 0.5;
  grab.px = e.clientX; grab.py = e.clientY; grab.pt = t;
  if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) < 5) return;
  if (!grab.moved) { grab.moved = true; ledge = null; sitting = false; climbAfter = false; mode = 'drag'; root.classList.add('cp-drag'); }
  x = e.clientX + scrollX + grab.ox; y = e.clientY + scrollY + grab.oy;
  lean = clamp(grab.vx / H * 3, -20, 20);
  if (Math.abs(grab.vx) > H * 0.5) left = grab.vx < 0;
});
function release(e, cancelled) {
  if (!grab || e.pointerId !== grab.id) return;
  const g = grab; grab = null; root.classList.remove('cp-drag');
  if (g.moved) {
    const fresh = now() - g.pt < 0.1;      // lasciata ferma: cade e basta
    startFall(fresh ? clamp(g.vx, -H * 12, H * 12) : 0, fresh ? clamp(g.vy, -H * 12, H * 12) : 0);
  } else if (!cancelled) { play(sitting ? 'perch_glitch' : 'grin'); say(); }
}
hit.addEventListener('pointerup', (e) => release(e, false));
hit.addEventListener('pointercancel', (e) => release(e, true));

// --- parlare ---
function say() {
  let pick = 0;
  if (greeted) do pick = Math.floor(Math.random() * LINES.length); while (pick === lastLine);
  greeted = true; lastLine = pick;
  speech = LINES[pick]; speechAt = now();
  nextTalk = speechAt + rand(15, 40);
  if (mode === 'walk') { climbAfter = false; mode = 'idle'; }
  if (mode === 'idle') until = Math.max(until, speechAt + speech.length / LPS + 1.2);
}

// --- animazione ---
const dancing = () => [...document.querySelectorAll('video')].some(v => !v.paused && !v.ended);
function baseClip(t) {
  if (mode === 'walk') return 'walk';
  if (mode === 'climb' || mode === 'fly' || mode === 'fall' || mode === 'drag') return 'dangle';
  const groove = mode === 'idle' && !talking(t) && dancing();
  return sitting ? (groove ? 'perch_dance' : 'perch') : (groove ? 'dance' : 'idle');
}
function current(t) {
  if (once) {
    const i = Math.floor((t - onceStart) * CLIPS[once][1]);
    if (i < CLIPS[once][0]) return [once, i];
    if (mode === 'arrive' || mode === 'leave') return [once, CLIPS[once][0] - 1];
    once = null;
  }
  const c = baseClip(t);
  if (c !== base) { base = c; baseStart = t; lastCycle = 0; blinkOn = false; }
  const index = Math.floor((t - baseStart) * CLIPS[c][1]), count = CLIPS[c][0];
  let cell = index % count;
  if (c !== 'idle' && c !== 'perch') return [c, cell];
  const cycle = Math.floor(index / count);
  if (cycle !== lastCycle) { lastCycle = cycle; blinkOn = Math.random() < 0.45; }
  if (blinkOn && cell >= BLINK_FROM && cell < BLINK_FROM + 4) return [c === 'idle' ? 'blink' : 'perch_blink', cell - BLINK_FROM];
  return [c, cell];
}
function mouthFor(ch, step) {
  const lower = ch.toLowerCase();
  if ('aeo'.includes(lower)) return ch !== lower ? 4 : 3;
  if ('iuy'.includes(lower)) return 2;
  if ('mbp'.includes(lower) || !/\p{L}/u.test(ch)) return 0;
  return step % 2 ? 1 : 2;
}

let shownKey = '';
function draw(t) {
  const [c, cell] = current(t);
  const seated = c.startsWith('perch');
  // come in Capri: in piedi i disegni guardano a sinistra, seduti a destra; seduta è disegnata più in scala
  let w, h, ox, oy, mirror;
  if (seated) { const p = H / 1.11; w = h = p; ox = -(left ? 0.70 : 0.30) * p; oy = -0.79 * p; mirror = left; }
  else { h = H; w = H * 240 / 384; ox = -w / 2; oy = -0.94 * H; mirror = !left; }
  const key = c + cell + w + mirror;
  if (key !== shownKey) {
    shownKey = key;
    Object.assign(img.style, {
      width: w + 'px', height: h + 'px', left: ox + 'px', top: oy + 'px',
      backgroundImage: `url(capri/${c}.png)`, backgroundSize: `${w * CLIPS[c][0]}px ${h}px`, backgroundPosition: `${-cell * w}px 0`,
      transform: mirror ? 'scaleX(-1)' : '',
    });
  }
  let talk = -1;
  if (talking(t) && c === 'idle') {
    const step = Math.max(0, Math.floor((t - speechAt) * MOUTH_RATE)), letter = Math.floor(step / MOUTH_RATE * LPS);
    if (letter < speech.length) talk = mouthFor(speech[letter], step);
  }
  if (talk >= 0) Object.assign(mouthEl.style, {
    display: 'block', width: w + 'px', height: h + 'px', left: ox + 'px', top: oy + 'px',
    backgroundImage: 'url(capri/mouth.png)', backgroundSize: `${w * 5}px ${h}px`, backgroundPosition: `${-talk * w}px 0`,
    transform: mirror ? 'scaleX(-1)' : '',
  });
  else mouthEl.style.display = 'none';
  // la parte che si prende col mouse: il corpo, non tutto il riquadro trasparente
  Object.assign(hit.style, { width: H * 0.42 + 'px', height: H * 0.86 + 'px', left: -H * 0.21 + 'px', top: -H * 0.9 + 'px' });
  const breathe = mode === 'idle' ? Math.sin(t * 1.75) * H / 110 : 0;
  root.style.transform = `translate(${x - scrollX}px, ${y - scrollY + breathe}px) rotate(${lean}deg)`;
}

let shownText = -1;
function drawBubble(t) {
  const show = speech && mode !== 'leave' && t < speechAt + speech.length / LPS + 4.5;
  if (!show) { bubble.style.display = 'none'; shownText = -1; return; }
  bubble.style.display = 'block';
  const n = clamp(Math.floor((t - speechAt) * LPS), 0, speech.length);
  if (n !== shownText) { shownText = n; textEl.textContent = speech.slice(0, n); }
  caretEl.style.visibility = n < speech.length || Math.floor(t * 2) % 2 === 0 ? 'visible' : 'hidden';
  const width = Math.min(330, innerWidth - 32);
  bubble.style.width = width + 'px';
  const hx = x - scrollX, hy = y - scrollY - H * (sitting ? 0.8 : 0.98), bh = bubble.offsetHeight;
  const bx = clamp(hx - width * 0.7, 16, innerWidth - width - 16);
  const up = hy - bh - 14 >= 8;
  const by = up ? hy - bh - 14 : y - scrollY + 16;
  bubble.className = up ? 'cp-up' : 'cp-down';
  tailEl.style.left = clamp(hx - bx - 5, 18, width - 24) + 'px';
  bubble.style.transform = `translate(${bx}px, ${by}px)`;
}

function tick() {
  const t = now(), dt = clamp(t - lastStep, 0, 0.05);
  lastStep = t;
  if (mode !== 'climb' && mode !== 'fly' && mode !== 'drag') lean *= 0.85;
  if (mode === 'arrive') { if (onceDone(t)) startFall(0, 0); }
  else if (mode === 'idle') { holdLedge(t); if (mode === 'idle' && t >= until && !talking(t)) decide(); }
  else if (mode === 'walk') { holdLedge(t); if (mode === 'walk') walk(dt); }
  else if (mode === 'climb') climb(dt, t);
  else if (mode === 'fly') flying(t);
  else if (mode === 'fall') fall(dt, t);
  if (grounded() && t >= nextTalk) say();
  // fuori dallo schermo da un po' (hai scorso la pagina): ricompare dove la vedi
  const out = y < scrollY || y - H > scrollY + innerHeight;
  if (!out || mode === 'drag') offSince = -1;
  else if (offSince < 0) offSince = t;
  else if (t - offSince > 6 && grounded()) { offSince = -1; spawn(); }
  draw(t);
  drawBubble(t);
  requestAnimationFrame(tick);
}

// spunta in un punto a caso della parte visibile, poi cade su quello che ha sotto
function spawn() {
  x = rand(H, Math.max(H + 1, pageWidth() - H));
  y = scrollY + rand(H * 1.3, Math.max(H * 1.4, innerHeight * 0.45));
  left = x - scrollX > innerWidth / 2;
  ledge = null; sitting = false; mode = 'arrive';
  play('arrive');
}

function start() {
  H = innerWidth < 600 ? 90 : 120;
  addEventListener('resize', () => { H = innerWidth < 600 ? 90 : 120; });
  document.body.append(root, bubble);
  spawn();
  nextTalk = now() + 3;
  lastStep = now();
  requestAnimationFrame(tick);
}

// prima scarica le animazioni, poi entra in scena
const loading = Object.keys(CLIPS).map(name => new Promise(done => { const i = new Image(); i.onload = i.onerror = done; i.src = `capri/${name}.png`; }));
const go = () => Promise.all(loading).then(start);
if (document.readyState === 'complete') go(); else addEventListener('load', go);
})();
