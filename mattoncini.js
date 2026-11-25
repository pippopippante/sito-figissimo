// Mattoncini nella home: il bottone "gioca qui" accanto a mattoncini fa cadere i mattoncini sulla pagina.
// Comandi piccoli in alto a destra; cestino in basso a destra, attaccato a sinistra dell'occhietto o di imprenditores.
// Titoli, link, pulsanti, foto, video e riquadri sono solidi: i mattoncini ci sbattono e ci si appoggiano.
// Il gioco viene da github.com/pippopippante/mattoncini (fisica Matter.js 0.19.0, caricata al primo clic).
// Codice di Emanuele Parmegiani
(() => {
const css = document.createElement('style');
css.textContent = `
  #mt-tela { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 997; display: none; }
  #mt-comandi { position: fixed; top: 6px; right: 6px; z-index: 1002; display: none; flex-direction: column; align-items: flex-end;
    gap: 4px; padding: 5px; background: #fffaf2; border: 1px solid #d9ccb8; border-radius: 8px; color: #2b2420;
    font: 12px/1 system-ui, sans-serif; user-select: none; }
  body.mt-aperto #mt-tela { display: block; }
  body.mt-aperto #mt-comandi { display: flex; }
  #mt-comandi .riga { display: flex; gap: 3px; align-items: center; }
  #mt-comandi button { font: inherit; color: inherit; background: #fffaf2; border: 1px solid #d9ccb8; border-radius: 6px;
    min-width: 26px; height: 26px; padding: 0 5px; cursor: pointer; }
  #mt-comandi .colore { width: 22px; min-width: 22px; height: 22px; padding: 0; border-radius: 50%; border: 2px solid rgba(0,0,0,.18); }
  #mt-comandi .colore[aria-pressed="true"] { box-shadow: 0 0 0 2px #fffaf2, 0 0 0 3px #2b2420; }
  #mt-comandi .misura svg { display: block; }
  #mt-comandi button:focus-visible { outline: 2px solid #0055bf; outline-offset: 1px; }
  #mt-comandi label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
  #mt-comandi input { margin: 0; accent-color: #0055bf; cursor: pointer; }
  #mt-comandi input[type=range] { width: 64px; }
`;
document.head.appendChild(css);

const btn = document.getElementById('mattoni');
const tela = document.createElement('canvas'), pannello = document.createElement('div');
tela.id = 'mt-tela'; tela.setAttribute('aria-hidden', 'true');
pannello.id = 'mt-comandi'; pannello.setAttribute('role', 'group'); pannello.setAttribute('aria-label', 'Comandi dei mattoncini');
pannello.innerHTML = `<div class="riga" id="mt-colori" role="group" aria-label="Colore"></div>
  <div class="riga" id="mt-misure" role="group" aria-label="Aggiungi un mattoncino"></div>
  <div class="riga"><label><input type="checkbox" id="mt-cestino"> Cestino</label>
    <input type="range" id="mt-grandezza" min="1" max="4" value="2" aria-label="Grandezza del cestino" hidden>
    <button id="mt-suono" aria-pressed="true" aria-label="Suono">\u{1F50A}</button><button id="mt-svuota">Svuota</button></div>`;
document.body.append(tela, pannello);

const aperto = () => document.body.classList.contains('mt-aperto');
let avviato = false;
btn.addEventListener('click', () => {
  const on = document.body.classList.toggle('mt-aperto');   // chiuso: spariscono anche i mattoncini, riaperto tornano dov'erano
  btn.setAttribute('aria-expanded', on);
  btn.textContent = on ? 'chiudi gioco' : 'gioca qui';
  if (on && !avviato) {
    avviato = true;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
    s.onload = gioco;
    document.head.append(s);
  }
});

function gioco() {
const { Engine, Bodies, Body, Composite, Sleeping, Query } = Matter;
const ctx = tela.getContext('2d');

// misure: passo fra i pallini, altezza del mattoncino (circa una riga di testo), pallino
const S = 16, H = S * 1.2, SW = S * 0.6, SH = S * 0.22;
// ponytail: tenuta tarata a occhio. FORZA = quanto sbalzo regge un pallino, TIRO = quanto peso ci può pendere sotto
const FORZA = 10, TIRO = 8, TIENI = 450; // ms da tenere premuto per staccare
const COLORI = [['Rosso', '#c91a09'], ['Blu', '#0055bf'], ['Giallo', '#f2cd37'], ['Verde', '#237841'],
  ['Arancione', '#fe8a18'], ['Bianco', '#f4f4f4'], ['Nero', '#27313a']];
const MISURE = [1, 2, 3, 4, 6];

const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
engine.gravity.y = 1.2;
const pavimento = Bodies.rectangle(0, 0, 20000, 1000, { isStatic: true, friction: 1 });
const muroS = Bodies.rectangle(0, 0, 1000, 40000, { isStatic: true });
const muroD = Bodies.rectangle(0, 0, 1000, 40000, { isStatic: true });
const soffitto = Bodies.rectangle(0, -500, 40000, 1000, { isStatic: true });   // niente resta nascosto sopra la pagina
Composite.add(engine.world, [pavimento, muroS, muroD, soffitto]);

// ---- il mondo: tutto in coordinate della pagina (scorre con lei); il pavimento è il fondo della pagina ----
let W = 0, HH = 0;
function misuraTela() { const d = devicePixelRatio || 1; tela.width = innerWidth * d; tela.height = innerHeight * d; }
misuraTela(); addEventListener('resize', misuraTela);

// solidi: le parole di titoli, testi e link, e pulsanti, foto, video, riquadri, l'occhietto
const SOLIDI = 'h1, h2, p, a, button, img, iframe, video, input, #occhio-mini';
function rettangolo(el) {
  if (el.matches('h1, h2, p, a')) {        // solo dove ci sono le parole, non tutta la riga
    const r = document.createRange(); r.selectNodeContents(el);
    const b = r.getBoundingClientRect();
    if (b.width > 0) return b;
  }
  return el.getBoundingClientRect();
}
let solidi = [], chiave = '', fondo = null;
// i pezzi che toccano il pavimento, o toccano un pezzo che lo tocca, e così via
function sulPavimento() {
  const vicini = new Map(), lega = (a, b) => (vicini.get(a) || vicini.set(a, []).get(a)).push(b);
  for (const p of engine.pairs.list) { lega(p.bodyA.parent, p.bodyB.parent); lega(p.bodyB.parent, p.bodyA.parent); }
  const visti = new Set([pavimento]), coda = [pavimento];
  while (coda.length) for (const v of vicini.get(coda.pop()) || []) if (!v.isStatic && !visti.has(v)) { visti.add(v); coda.push(v); }
  visti.delete(pavimento);
  return visti;
}
// ponytail: rimisura tutto a ogni fotogramma (una ventina di elementi); se la pagina cresce molto, rimisurare solo su scroll/resize
function aggiornaMondo() {
  const w = document.documentElement.clientWidth, h = Math.max(document.documentElement.scrollHeight, innerHeight);
  if (w !== W || h !== HH) {
    W = w; HH = h;
    Body.setPosition(muroS, { x: -500, y: HH / 2 });
    Body.setPosition(muroD, { x: W + 500, y: HH / 2 });
  }
  // il pavimento è il fondo dello schermo, come il cestino: quando la pagina scorre,
  // quello che ci è appoggiato (anche uno sopra l'altro) si sposta con lui
  const f = scrollY + innerHeight;
  if (f !== fondo) {
    if (fondo !== null) for (const b of sulPavimento()) { Sleeping.set(b, false); Body.translate(b, { x: 0, y: f - fondo }); }
    fondo = f;
    Body.setPosition(pavimento, { x: W / 2, y: fondo + 500 });
  }
  const rs = [];
  for (const el of document.querySelectorAll(SOLIDI)) {
    if (el.closest('#mt-comandi') || getComputedStyle(el).visibility === 'hidden') continue;
    const r = rettangolo(el);
    if (r.width < 2 || r.height < 2) continue;
    rs.push([r.left + scrollX, r.top + scrollY, r.width, r.height].map(Math.round));
  }
  const k = rs.join(';');
  if (k !== chiave) {                      // qualcosa si è spostato (scorrimento, riquadro che si apre…)
    chiave = k;
    Composite.remove(engine.world, solidi);
    solidi = rs.map(([x, y, w, h]) => Bodies.rectangle(x + w / 2, y + h / 2, w, h, { isStatic: true, friction: 0.8 }));
    Composite.add(engine.world, solidi);
    for (const g of gruppi) Sleeping.set(g.body, false);
  }
  aggiornaCestino();
}

// ---- cestino: fisso in basso a destra; bordi e corpo solidi, sparisce tutto quello che entra nella bocca ----
const vuoiCestino = document.getElementById('mt-cestino'), grandezza = document.getElementById('mt-grandezza');
// Immagine: cestino.png (47 x 61 pixel). Righe 0-3 = bocca (va dietro ai mattoncini), dalla riga 4 = bordo e corpo (davanti).
const imgCestino = new Image(); imgCestino.src = 'cestino.png';
const CW = 47, CH = 61, BOCCA = 4;
let cestino = null, chiaveC = '';
// il bordo destro del cestino: il lato dello schermo, o il lato sinistro dell'occhietto / di imprenditores se ci sono
function bordoDestro() {
  let x = document.documentElement.clientWidth;
  for (const el of [document.getElementById('occhio-mini'), document.getElementById('gioco')]) {
    if (!el) continue;
    const st = getComputedStyle(el), r = el.getBoundingClientRect();
    if (st.position !== 'fixed' || st.visibility === 'hidden' || !r.width || !r.height || r.top >= innerHeight) continue;
    x = Math.min(x, r.left);
  }
  return x;
}
function aggiornaCestino() {
  if (!vuoiCestino.checked) {
    if (cestino) Composite.remove(engine.world, cestino.pareti);
    cestino = null; chiaveC = ''; return;
  }
  const maxP = Math.max(1, Math.min(Math.floor(innerWidth * 0.3 / CW), Math.floor(innerHeight * 0.4 / CH)));
  if (+grandezza.max !== maxP) grandezza.max = maxP;
  const p = Math.min(+grandezza.value, maxP);
  const x = Math.round(scrollX + bordoDestro() - CW * p), fondo = Math.round(scrollY + innerHeight), top = fondo - CH * p;
  const k = [x, fondo, p].join();
  if (k === chiaveC) return;
  chiaveC = k;
  if (cestino) Composite.remove(engine.world, cestino.pareti);
  // la bocca che cancella: fra i due bordi, dal 10% sotto il cerchio fino al corpo solido
  const y0 = top + 4 * p + Math.round(CH * p * 0.1);
  const zona = { x0: x + 4 * p, x1: x + 43 * p, y0, y1: y0 + 5 * p + H };
  const blocco = (x0, y0, x1, y1) => Bodies.rectangle((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, { isStatic: true, friction: 0.5 });
  const pareti = [
    blocco(x + 2 * p, top + p, x + 4 * p, zona.y1),     // bordo sinistro della bocca
    blocco(x + 43 * p, top + p, x + 45 * p, zona.y1),   // bordo destro
    blocco(x + 2 * p, zona.y1, x + 45 * p, fondo),      // corpo pieno
  ];
  cestino = { x, fondo, p, top, pareti, zona };
  Composite.add(engine.world, pareti);
  for (const g of gruppi) Sleeping.set(g.body, false);
}
const toccaCestino = g => {
  const z = cestino.zona;
  return g.bricks.some(({ part: { vertices: v } }) => {
    const xs = v.map(q => q.x), ys = v.map(q => q.y);
    return Math.max(...xs) > z.x0 && Math.min(...xs) < z.x1 && Math.max(...ys) > z.y0 && Math.min(...ys) < z.y1;
  });
};

// ---- geometria ----
const rot = (v, a) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) });
const piu = (a, b) => ({ x: a.x + b.x, y: a.y + b.y }), meno = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const norm = a => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const centroLocale = b => ({ x: (b.gx + b.w / 2) * S, y: b.gy * H });
const sovrap = (a, b) => Math.min(a.gx + a.w, b.gx + b.w) - Math.max(a.gx, b.gx);
const uniti = (a, b) => Math.abs(a.gy - b.gy) === 1 && sovrap(a, b) > 0;

// Un gruppo è una costruzione: mattoncini agganciati = un solo corpo rigido.
const gruppi = new Set();
const angolo = g => g.theta0 + g.body.angle;
function origine(g) {
  const b = g.bricks[0];
  return meno(b.part.position, rot(centroLocale(b), angolo(g)));
}
function creaGruppo(bricks, O, a, vel = { x: 0, y: 0 }, va = 0) {
  const parts = bricks.map(b => {
    const c = piu(O, rot(centroLocale(b), a));
    const p = Bodies.rectangle(c.x, c.y, b.w * S, H, { angle: a });
    p.brick = b; b.part = p; return p;
  });
  const body = Body.create({ parts, friction: 0.9, frictionStatic: 1, restitution: 0, frictionAir: 0 });
  Body.setVelocity(body, vel); Body.setAngularVelocity(body, va);
  const g = { body, bricks, theta0: a };
  bricks.forEach(b => b.gruppo = g);
  gruppi.add(g); Composite.add(engine.world, body);
  return g;
}
function togli(g) { gruppi.delete(g); Composite.remove(engine.world, g.body); }
function ricostruisci(g, liste) {
  const O = origine(g), a = angolo(g), v = Body.getVelocity(g.body), va = Body.getAngularVelocity(g.body);
  togli(g);
  return liste.map(l => creaGruppo(l, O, a, v, va));
}
function pezzi(bricks, taglia = () => false) {
  const resto = new Set(bricks), out = [];
  while (resto.size) {
    const [primo] = resto; resto.delete(primo);
    const comp = [primo];
    for (let i = 0; i < comp.length; i++)
      for (const b of [...resto])
        if (uniti(comp[i], b) && !taglia(comp[i], b)) { resto.delete(b); comp.push(b); }
    out.push(comp);
  }
  return out;
}

// ---- azioni ----
let colore = COLORI[0][1];
function nuovo(w) {
  const a = (Math.random() - 0.5) * 0.3, now = performance.now();
  const b = { w, colore, gx: 0, gy: 0, nato: now, pop: -1e9 };
  // nasce appena sotto i comandi, in un punto libero (niente link, foto o altri pezzi lì) e mai sopra il cestino;
  // prima prova verso il centro, poi dappertutto
  const lo = w * S / 2 + 10, hi = W - w * S / 2 - 10, giro = 120;
  const y = scrollY + pannello.getBoundingClientRect().bottom + H, ostacoli = [...solidi, ...[...gruppi].map(g => g.body)];
  const sopraCestino = c => cestino && c + w * S / 2 > cestino.x && c - w * S / 2 < cestino.x + CW * cestino.p;
  let x = W / 2;
  for (let i = 0; i < 40; i++) {
    const c = Math.max(lo, Math.min(hi, i < 15 ? W / 2 + (Math.random() - 0.5) * 2 * giro : lo + Math.random() * (hi - lo)));
    if (sopraCestino(c)) continue;
    if (!Query.region(ostacoli, { min: { x: c - w * S / 2 - 4, y: y - H }, max: { x: c + w * S / 2 + 4, y: y + H } }).length) { x = c; break; }
  }
  const pos = { x, y };
  creaGruppo([b], meno(pos, rot(centroLocale(b), a)), a, { x: 0, y: 2 }, (Math.random() - 0.5) * 0.04);
}
function stacca(b, inMano) {
  const g = b.gruppo, now = performance.now();
  const haSotto = g.bricks.some(x => x.gy === b.gy + 1 && uniti(x, b));
  const lato = haSotto ? 1 : -1;
  const taglia = (p, q) => (p === b && q.gy === b.gy + lato) || (q === b && p.gy === b.gy + lato);
  const parti = pezzi(g.bricks, taglia);
  b.pop = now;
  if (parti.length < 2) { suono('tok'); return; }
  const nuovi = ricostruisci(g, parti), mio = nuovi.find(x => x.bricks.includes(b));
  if (haSotto && !inMano) Body.setVelocity(mio.body, { x: 0, y: -3 });
  mio.bricks.forEach(x => x.pop = now);
  const p = piu(b.part.position, rot({ x: 0, y: lato * H / 2 }, angolo(mio)));
  sbuffo(p.x, p.y, 12, b.colore, 4);
  suono('pop');
}
function aggancia(D, t) {
  togli(D);
  D.bricks.forEach(d => { d.gx += t.dx; d.gy += t.dy; d.pop = performance.now(); });
  ricostruisci(t.g, [[...t.g.bricks, ...D.bricks]]);
  sbuffo(t.pos.x, t.pos.y, 8, '#ffffff', 3);
  suono('clic');
}
function cercaAggancio(D, r) {
  const p = r.part.position, ad = angolo(D);
  let best = null;
  for (const g of gruppi) {
    if (g === D) continue;
    const a = angolo(g);
    if (Math.abs(norm(a - ad)) > 0.8) continue;
    const O = origine(g), l = rot(meno(p, O), -a);
    const gy0 = Math.round(l.y / H), gx0 = Math.round(l.x / S - r.w / 2);
    for (let gy = gy0 - 1; gy <= gy0 + 1; gy++) for (let gx = gx0 - 1; gx <= gx0 + 1; gx++) {
      const dx = gx - r.gx, dy = gy - r.gy, sposta = d => ({ gx: d.gx + dx, gy: d.gy + dy, w: d.w });
      let libero = true, unito = false;
      for (const d of D.bricks) {
        const q = sposta(d);
        for (const b of g.bricks) {
          if (b.gy === q.gy && sovrap(b, q) > 0) { libero = false; break; }
          if (uniti(b, q)) unito = true;
        }
        if (!libero) break;
      }
      if (!libero || !unito) continue;
      const pos = piu(O, rot(centroLocale(sposta(r)), a)), dist = Math.hypot(pos.x - p.x, pos.y - p.y);
      if (dist < H && (!best || dist < best.dist))
        best = { g, dx, dy, a, pos, dist, ombre: D.bricks.map(d => ({ b: d, pos: piu(O, rot(centroLocale(sposta(d)), a)) })) };
    }
  }
  return best;
}
function controllaCarichi() {
  const appoggiati = new Set();
  for (const pair of engine.pairs.list)
    for (const [p, q] of [[pair.bodyA, pair.bodyB], [pair.bodyB, pair.bodyA]])
      if (p.brick && p.parent !== q.parent && pair.collision.supports.some(s => s && s.y > p.position.y + H * 0.3))
        appoggiati.add(p.brick);

  for (const g of [...gruppi]) {
    if (g.bricks.length < 2 || (presa && presa.b.gruppo === g)) continue;
    const a = angolo(g);
    if (Math.abs(norm(a)) > 0.35 || g.body.speed > 1.5) continue;
    const O = origine(g);
    let peggio = null;
    for (const x of g.bricks) for (const y of g.bricks) {
      if (y.gy !== x.gy - 1) continue;
      const n = sovrap(x, y);
      if (n <= 0) continue;
      const taglia = (p, q) => (p === x && q === y) || (p === y && q === x);
      const parti = pezzi(g.bricks, taglia);
      if (parti.length < 2) continue;
      const [A, B] = parti, okA = A.some(b => appoggiati.has(b)), okB = B.some(b => appoggiati.has(b));
      if (okA === okB) continue;
      const carico = okA ? B : A, appeso = carico.includes(x);
      let M = 0, cx = 0;
      for (const b of carico) { M += b.w; cx += b.w * b.part.position.x; }
      cx /= M;
      const xs = Math.max(x.gx, y.gx);
      const e1 = piu(O, rot({ x: xs * S, y: (x.gy - 0.5) * H }, a)), e2 = piu(O, rot({ x: (xs + n) * S, y: (x.gy - 0.5) * H }, a));
      const fuori = Math.max(0, cx - Math.max(e1.x, e2.x), Math.min(e1.x, e2.x) - cx) / S;
      let r = M * fuori / (n * FORZA);
      if (appeso) r = Math.max(r, M / (n * TIRO));
      if (r > 1 && (!peggio || r > peggio.r)) peggio = { r, taglia, J: { x: (e1.x + e2.x) / 2, y: (e1.y + e2.y) / 2 } };
    }
    if (peggio) {
      ricostruisci(g, pezzi(g.bricks, peggio.taglia));
      sbuffo(peggio.J.x, peggio.J.y, 16, '#8a7d70', 5);
      suono('crac');
    }
  }
}

// ---- mouse e dita: la tela non prende i clic, così i link sotto funzionano;
// se si preme proprio su un mattoncino, il clic lo prende lui e il link sotto non parte ----
let presa = null, bloccaClic = false;
const punto = e => ({ x: e.clientX + scrollX, y: e.clientY + scrollY });
const tutti = () => [...gruppi].sort((a, b) => b.body.position.y - a.body.position.y)
  .flatMap(g => [...g.bricks].sort((a, b) => b.gy - a.gy));
function trova(p) {
  for (const b of tutti().reverse()) {
    const l = rot(meno(p, b.part.position), -angolo(b.gruppo)), w = b.w * S;
    if (Math.abs(l.x) > w / 2) continue;
    if (Math.abs(l.y) <= H / 2) return b;
    const dx = (l.x + w / 2) % S;
    if (l.y < -H / 2 && l.y >= -H / 2 - SH && dx >= (S - SW) / 2 && dx <= (S + SW) / 2) return b;
  }
}
const sopra = e => e.target.closest?.('#mt-comandi, #capri');   // comandi e mini Capri stanno davanti ai mattoncini
addEventListener('pointerdown', e => {
  bloccaClic = false;
  if (!aperto() || presa || sopra(e)) return;
  const p = punto(e), b = trova(p);
  if (!b) return;
  bloccaClic = true;
  e.preventDefault(); e.stopPropagation();
  sbloccaAudio();
  presa = { b, id: e.pointerId, x: p.x, y: p.y, x0: p.x, y0: p.y, cx: e.clientX, cy: e.clientY, t0: performance.now(), modo: 'attesa', storia: [] };
}, true);
addEventListener('click', e => { if (bloccaClic) { bloccaClic = false; e.preventDefault(); e.stopPropagation(); } }, true);
// sul telefono: premendo un mattoncino la pagina non scorre
addEventListener('touchstart', e => { if (aperto() && !sopra(e) && trova(punto(e.touches[0]))) e.preventDefault(); }, { passive: false, capture: true });
addEventListener('pointermove', e => {
  if (!aperto()) return;
  if (!presa) { if (e.pointerType === 'mouse') document.documentElement.style.cursor = !sopra(e) && trova(punto(e)) ? 'grab' : ''; return; }
  if (e.pointerId !== presa.id) return;
  const p = punto(e), t = performance.now();
  presa.x = p.x; presa.y = p.y; presa.cx = e.clientX; presa.cy = e.clientY;
  presa.storia.push({ t, x: p.x, y: p.y });
  while (presa.storia.length > 2 && t - presa.storia[0].t > 60) presa.storia.shift();
  if (presa.modo === 'attesa' && Math.hypot(p.x - presa.x0, p.y - presa.y0) > 6) inMano();
});
function inMano() {
  const body = presa.b.gruppo.body;
  presa.modo = 'gruppo';
  presa.lg = rot(meno({ x: presa.x0, y: presa.y0 }, body.position), -body.angle);
  document.documentElement.style.cursor = 'grabbing';
}
function lascia(e) {
  if (!presa || e.pointerId !== presa.id) return;
  const t = presa.aggancio, g = presa.b.gruppo;
  if (presa.modo === 'attesa') stacca(presa.b);
  else if (t && gruppi.has(t.g)) aggancia(g, t);
  else {
    Body.setPosition(g.body, piu(g.body.position, meno(presa, piu(g.body.position, rot(presa.lg, g.body.angle)))));
    const s = presa.storia, a = s[0], z = s[s.length - 1], now = performance.now();
    let v = { x: 0, y: 0 };
    if (s.length > 1 && now - z.t < 60 && z.t > a.t) v = { x: (z.x - a.x) / (z.t - a.t) * BASE, y: (z.y - a.y) / (z.t - a.t) * BASE };
    const k = Math.min(1, 80 / (Math.hypot(v.x, v.y) || 1)); // ponytail: tetto a ~4800 px/s, oltre un pezzo può passare attraverso un altro
    Body.setVelocity(g.body, { x: v.x * k, y: v.y * k });
  }
  presa = null;
  document.documentElement.style.cursor = '';
}
addEventListener('pointerup', lascia);
addEventListener('pointercancel', lascia);

const buttati = [];
function butta(g) {
  const z = cestino.zona, now = performance.now(), fondo = { x: (z.x0 + z.x1) / 2, y: z.y0 + 1.5 * H };
  for (const b of g.bricks) buttati.push({ b, da: { ...b.part.position }, a: angolo(g), t0: now, fondo });
  togli(g);
  sbuffo(g.body.position.x, g.body.position.y, 10, '#ffffff', 3);
  suono('pop');
}
function guida() {
  if (presa.modo === 'attesa') return;
  const g = presa.b.gruppo, body = g.body;
  Sleeping.set(body, false);
  const gp = piu(body.position, rot(presa.lg, body.angle));
  const v = meno(presa, gp), k = BASE / PASSO;
  Body.setVelocity(body, { x: v.x * k, y: v.y * k });
  const meta = presa.aggancio ? presa.aggancio.a : 0;
  Body.setAngularVelocity(body, norm(meta - angolo(g)) * 0.25);
}

// ---- effetti ----
const scintille = [];
function sbuffo(x, y, n, c, forza) {
  for (let i = 0; i < n; i++)
    scintille.push({ x, y, vx: (Math.random() - 0.5) * forza * 2, vy: -Math.random() * forza, vita: 1, r: 1.5 + Math.random() * 2, c });
}
let audio = null, muto = false;
function sbloccaAudio() { if (!audio) try { audio = new AudioContext(); } catch (e) {} }
function suono(tipo) {
  if (muto || !audio) return;
  const t = audio.currentTime, out = audio.createGain();
  out.connect(audio.destination);
  if (tipo === 'crac') {
    const len = 0.25, buf = audio.createBuffer(1, audio.sampleRate * len, audio.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    const src = audio.createBufferSource(), f = audio.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 900;
    src.buffer = buf; src.connect(f); f.connect(out); out.gain.value = 0.9; src.start(t);
    return;
  }
  const o = audio.createOscillator(), [f0, f1, dur] = { clic: [2600, 1400, 0.04], pop: [700, 260, 0.09], tok: [400, 300, 0.05] }[tipo];
  o.type = tipo === 'clic' ? 'triangle' : 'sine';
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  out.gain.setValueAtTime(0.3, t); out.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(out); o.start(t); o.stop(t + dur);
}

// ---- disegno ----
function scuro(hex, k) {
  const n = parseInt(hex.slice(1), 16), f = c => Math.round(c * k);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function mattone(b, x, y, a, k, extra) {
  const w = b.w * S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(k, k);
  if (extra) extra();
  for (let i = 0; i < b.w; i++) {
    const sx = -w / 2 + (i + 0.5) * S - SW / 2;
    ctx.fillStyle = b.colore; ctx.fillRect(sx, -H / 2 - SH, SW, SH + 1);
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(sx + 1, -H / 2 - SH + 1, SW * 0.2, SH - 1);
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(sx + SW * 0.8, -H / 2 - SH, SW * 0.2, SH);
  }
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = b.colore;
  ctx.beginPath(); ctx.roundRect(-w / 2, -H / 2, w, H, 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(-w / 2, H / 2 - H * 0.14, w, H * 0.14);
  ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(-w / 2 + 2, -H / 2 + 2, w - 4, 1.5);
  ctx.strokeStyle = scuro(b.colore === '#f4f4f4' ? '#c8c8c8' : b.colore, 0.6); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(-w / 2 + 0.5, -H / 2 + 0.5, w - 1, H - 1, 2); ctx.stroke();
  ctx.restore();
}
function disegna(now, f) {
  const d = devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, tela.width, tela.height);
  ctx.setTransform(d, 0, 0, d, -scrollX * d, -scrollY * d);   // si disegna in coordinate della pagina
  ctx.imageSmoothingEnabled = false;
  const disegnaCestino = (r0, r1) => imgCestino.complete && ctx.drawImage(imgCestino, 0, r0, CW, r1 - r0,
    cestino.x, cestino.top + r0 * cestino.p, CW * cestino.p, (r1 - r0) * cestino.p);
  if (cestino) disegnaCestino(0, BOCCA);

  const presi = presa && presa.modo !== 'attesa' ? presa.b.gruppo : null;
  const off = presi ? meno(presa, piu(presi.body.position, rot(presa.lg, presi.body.angle))) : null;
  for (const b of tutti()) {
    let k = 1;
    const tp = (now - b.pop) / 180; if (tp < 1) k = 1 + 0.12 * Math.sin(tp * Math.PI);
    const tn = (now - b.nato) / 220; if (tn < 1) k *= 0.6 + 0.4 * (1 - (1 - tn) ** 3);
    const sel = b.gruppo === presi, p = sel ? piu(b.part.position, off) : b.part.position;
    mattone(b, p.x, p.y, angolo(b.gruppo), k, sel ? () => {
      ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    } : null);
  }
  if (buttati.length) {
    for (let i = buttati.length - 1; i >= 0; i--) {
      const v = buttati[i], t = (now - v.t0) / 260, c = v.fondo;
      if (t >= 1) { buttati.splice(i, 1); continue; }
      const e = t * t;
      ctx.globalAlpha = 1 - t * 0.6;
      mattone(v.b, v.da.x + (c.x - v.da.x) * e, v.da.y + (c.y - v.da.y) * e, v.a * (1 - e), 1 - e * 0.9);
    }
    ctx.globalAlpha = 1;
  }
  if (cestino) disegnaCestino(BOCCA, CH);
  if (presa && presa.modo === 'attesa' && now - presa.t0 > 100) {
    const f = Math.min(1, (now - presa.t0) / TIENI);
    ctx.strokeStyle = 'rgba(43,36,32,.65)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(presa.x, presa.y, 16, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
  }
  if (presa && presa.aggancio) {
    const t = presa.aggancio;
    ctx.globalAlpha = 0.35;
    for (const o of t.ombre) mattone(o.b, o.pos.x, o.pos.y, t.a, 1);
    ctx.globalAlpha = 1;
  }
  for (let i = scintille.length - 1; i >= 0; i--) {
    const s = scintille[i];
    s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.25 * f; s.vita -= 0.035 * f;
    if (s.vita <= 0) { scintille.splice(i, 1); continue; }
    ctx.globalAlpha = s.vita; ctx.fillStyle = s.c;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---- ciclo: un passo di fisica per fotogramma dello schermo; chiuso sta fermo ----
const BASE = 1000 / 60;
let PASSO = BASE, acc = 0, ultimo = performance.now(), daControllo = 0;
const tempi = [];
function ciclo(now) {
  requestAnimationFrame(ciclo);
  const dt = Math.min(now - ultimo, 100); ultimo = now;
  if (!aperto()) { presa = null; return; }
  if (tempi.length < 30 && dt > 0) {
    tempi.push(dt);
    if (tempi.length === 30) PASSO = Math.min(BASE, Math.max(1000 / 165, tempi.sort((a, b) => a - b)[15]));
  }
  aggiornaMondo();
  acc += dt;
  if (presa) {
    presa.x = presa.cx + scrollX; presa.y = presa.cy + scrollY;   // se la pagina scorre, il pezzo resta sotto il dito
    if (presa.modo === 'attesa' && now - presa.t0 > TIENI) { stacca(presa.b, true); inMano(); }
    const mosso = Math.hypot(presa.x - presa.x0, presa.y - presa.y0) > 6;
    presa.aggancio = presa.modo === 'gruppo' && mosso ? cercaAggancio(presa.b.gruppo, presa.b) : null;
  }
  while (acc > PASSO / 2) {
    if (presa) guida();
    Engine.update(engine, PASSO);
    acc -= PASSO;
    if ((daControllo += PASSO) > 333) { daControllo = 0; controllaCarichi(); }
  }
  if (cestino) for (const g of [...gruppi])
    if (!(presa && presa.b.gruppo === g) && toccaCestino(g)) butta(g);
  disegna(now, dt / BASE);
}
requestAnimationFrame(ciclo);

// ---- comandi ----
const boxColori = document.getElementById('mt-colori'), boxMisure = document.getElementById('mt-misure');
function miniMattone(w) {
  const sw = 6, h = 9, sh = 3, larg = w * sw;
  let studs = '';
  for (let i = 0; i < w; i++) studs += `<rect x="${i * sw + 1}" y="0" width="4" height="${sh + 1}" fill="${colore}"/>`;
  return `<svg width="${larg}" height="${h + sh}" aria-hidden="true">${studs}<rect x="0" y="${sh}" width="${larg}" height="${h}" rx="1.5" fill="${colore}" stroke="rgba(0,0,0,.35)"/></svg>`;
}
function aggiornaBarra() {
  boxMisure.innerHTML = '';
  for (const w of MISURE) {
    const b = document.createElement('button');
    b.className = 'misura'; b.innerHTML = miniMattone(w);
    b.setAttribute('aria-label', `Aggiungi un mattoncino da ${w}`);
    b.onclick = () => { sbloccaAudio(); nuovo(w); };
    boxMisure.append(b);
  }
}
for (const [nome, c] of COLORI) {
  const b = document.createElement('button');
  b.className = 'colore'; b.style.background = c; b.setAttribute('aria-label', nome);
  b.setAttribute('aria-pressed', c === colore);
  b.onclick = () => {
    colore = c;
    boxColori.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    aggiornaBarra();
  };
  boxColori.append(b);
}
aggiornaBarra();
vuoiCestino.onchange = () => { grandezza.hidden = !vuoiCestino.checked; };
document.getElementById('mt-svuota').onclick = () => { presa = null; [...gruppi].forEach(togli); };
document.getElementById('mt-suono').onclick = e => { muto = !muto; e.currentTarget.textContent = muto ? '\u{1F507}' : '\u{1F50A}'; e.currentTarget.setAttribute('aria-pressed', !muto); };
}
})();
