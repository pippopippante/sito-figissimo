// Occhio ASCII: alla prima pressione di "Cosa e' quello?" un occhio fatto di lettere si apre,
// guarda a destra e a sinistra, guarda te e ti porta dentro la pupilla; poi resta un occhietto
// nell'angolo che segue il cursore.
// Codice di Emanuele Parmegiani
(() => {
const css = document.createElement('style');
css.textContent = `
  #occhio-eye { position: fixed; inset: 0; width: 100%; height: 100%; display: none; z-index: 1000; cursor: pointer; }
  #occhio-skip {
    position: fixed; z-index: 1001; display: none; cursor: pointer; border: 0; border-radius: 999px;
    padding: .7rem 1.4rem; min-height: 44px; font: 14px system-ui, sans-serif; color: #fff; background: rgba(30, 18, 12, .6);
    right: max(16px, env(safe-area-inset-right, 0px)); bottom: max(16px, env(safe-area-inset-bottom, 0px));
  }
  #occhio-skip:focus-visible { outline: 3px solid #FFA343; outline-offset: 3px; }
  body.occhio-play { overflow: hidden; }
  .occhio-play #occhio-eye, .occhio-play #occhio-skip { display: block; }
  #occhio-mini {
    position: fixed; z-index: 999; display: none; pointer-events: none; width: 260px; height: 170px;
    right: max(16px, env(safe-area-inset-right, 0px)); bottom: max(16px, env(safe-area-inset-bottom, 0px));
    /* nero pieno dietro l'occhio che verso i bordi sfuma nella pagina (le lettere restano piene) */
    background: radial-gradient(closest-side, #000 50%, rgba(0,0,0,.55) 75%, transparent);
  }
  @media (max-width: 599px) { #occhio-mini { width: 170px; height: 112px; } }
  .occhio-done #occhio-mini { display: block; }
`;
document.head.appendChild(css);
const cv = document.createElement('canvas'), skip = document.createElement('button'), mini = document.createElement('canvas');
cv.id = 'occhio-eye'; cv.setAttribute('role', 'img');
cv.setAttribute('aria-label', "Un occhio fatto di lettere si apre, guarda a destra e a sinistra, poi guarda te e lo sguardo entra nella pupilla");
skip.id = 'occhio-skip'; skip.type = 'button'; skip.textContent = 'Salta ›';
mini.id = 'occhio-mini'; mini.setAttribute('aria-hidden', 'true');
document.body.append(cv, skip, mini);
const ctx = cv.getContext('2d');
const RAMP = " .'`,:;~-+=*!ilcoxzO0%#&@";
const GLYPHS = RAMP + "/\\|";
const LASH = { '/': RAMP.length, '\\': RAMP.length + 1, '|': RAMP.length + 2 };
const END = 8.6;                      // al massimo; di solito finisce prima, quando la pupilla copre lo schermo

let V;                                 // la griglia di lettere dell'occhio grande
const SPEED = 0.65;                    // 1 = velocità di prima, più basso = più lento

// una griglia di lettere su un canvas (serve sia all'occhio grande sia a quello nell'angolo)
function makeView(canvas, W, H, fs, u) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.font = `${fs}px Consolas, "Cascadia Mono", Menlo, monospace`; ctx.textBaseline = 'middle';
  const cw = ctx.measureText('M').width, ch = Math.round(fs * 1.2);
  const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch);
  const colCv = document.createElement('canvas'); colCv.width = cols; colCv.height = rows;
  const colCtx = colCv.getContext('2d');
  return { ctx, dpr, W, H, cw, ch, cols, rows, u, rowBuf: new Array(cols), colCv, colCtx, colImg: colCtx.createImageData(cols, rows) };
}
function resize() {
  const W = innerWidth, H = innerHeight;
  const fs = W < 600 ? 8 : W < 1100 ? 10 : W < 1600 ? 12 : 13;    // grandezza delle lettere (più piccole = più definito)
  V = makeView(cv, W, H, fs, Math.min(W / 2.2, H / 1.6));           // u = metà larghezza dell'occhio in px
}

// ---- piccoli aiuti ----
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const ss = (a, b, t) => { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function hash(x, y) { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); }
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const p = xf * xf * (3 - 2 * xf), q = yf * yf * (3 - 2 * yf);
  const A = hash(xi, yi), B = hash(xi + 1, yi), C = hash(xi, yi + 1), D = hash(xi + 1, yi + 1);
  return A + (B - A) * p + (C - A) * q + (A - B - C + D) * p * q;
}

// ---- la regia: cosa fa l'occhio al secondo t ----
function state(t) {
  const o = 0.55 * ss(0.5, 1.1, t) - 0.25 * ss(1.2, 1.4, t) + 0.70 * ss(1.5, 2.1, t); // si apre, ricade un po', si apre del tutto
  const live = 0.012 * (noise(t * 2.5, 1) - 0.5);                                     // piccoli tremolii, come un occhio vero
  const gx = 0.75 * ss(2.4, 2.58, t) - 1.5 * ss(3.2, 3.45, t) + 0.75 * ss(4.0, 4.18, t) + live; // destra, sinistra, in camera
  const gy = -0.35 * (1 - ss(1.6, 2.2, t)) + live * 0.6;
  const rp = 0.17 + 0.02 * ss(4.2, 4.6, t) + 0.05 * ss(4.8, 7.6, t);                // la pupilla si allarga quando ti guarda
  const zt = clamp((t - 4.8) / 3.2, 0, 1);                                             // durata dello zoom
  const zoom = Math.exp(Math.log(70) * zt * zt * zt);                                  // zoom che parte piano e accelera
  const f = ss(4.8, 6.2, t);
  return { o, gx, gy, rp, zoom, fx: 0, fy: (0.08 + gy * 0.2) * f, reveal: ss(6.65, 7.3, t) };
}

// ---- che colore e che lettera ha il punto (x, y) dell'occhio ----
let R, G, B;
function shade(x, y, s, cellW) {
  const k = Math.max(0, 1 - x * x);                 // occhio dritto e simmetrico
  const closed = -0.10 * k;
  const topO = 0.50 * Math.pow(k, 0.75);
  const botO = -0.30 * Math.pow(k, 0.9);
  const top = closed + (topO - closed) * s.o;
  const bot = closed + (botO - closed) * s.o;
  const crease = topO + 0.17 * Math.pow(k, 0.6) + 0.02;

  // ciglia di sopra: in su da aperto, in giù da chiuso
  const dir = s.o > 0.3 ? 1 : -1;
  const h = (y - top) * dir;
  if (h > 0 && h < 0.3) {
    // tante ciglia lunghe, ognuna con la sua piega verso l'esterno
    const LD = 72, q = Math.floor((x - 1.1 * x * h) * LD);
    const lean = 1.1 * x + (hash(q, 8.8) - 0.5) * 0.5, x0 = x - lean * h;
    if (Math.abs(x0) < 0.96 && hash(q, 1.7) > 0.12) {
      const cx0 = (q + 0.5) / LD + (hash(q, 5.1) - 0.5) * 0.6 / LD;
      const len = 0.24 * (0.4 + 0.6 * Math.sqrt(Math.max(0, 1 - x0 * x0))) * (0.6 + 0.6 * hash(q, 2.3)) * (dir > 0 ? 1 : 0.6);
      if (h < len && Math.abs(x0 - cx0) < cellW * 0.55) {
        R = 45; G = 30; B = 24;
        const sl = lean * dir;
        return sl > 0.3 ? LASH['/'] : sl < -0.3 ? LASH['\\'] : LASH['|'];
      }
    }
  }
  // ciglia di sotto, corte e rade
  if (s.o > 0.5) {
    const h2 = bot - y;
    if (h2 > 0.03 && h2 < 0.13) {                      // partono sotto il bordino rosa
      const lean = 0.8 * x, x0 = x - lean * h2, q = Math.floor(x0 * 50);
      if (Math.abs(x0) < 0.85 && hash(q, 9.3) > 0.45 && Math.abs(x0 - (q + 0.5) / 50) < cellW * 0.55 && h2 < 0.07 + 0.05 * hash(q, 4.4)) {
        R = 80; G = 55; B = 45;
        return -lean > 0.3 ? LASH['/'] : -lean < -0.3 ? LASH['\\'] : LASH['|'];
      }
    }
  }

  let r, g, b;
  if (Math.abs(x) < 1 && y < top && y > bot) {
    // --- bulbo: sclera, iride, pupilla ---
    const icx = s.gx * 0.42, icy = 0.08 + s.gy * 0.2;  // l'iride tocca le due palpebre, come nelle foto
    const ax = Math.cos(s.gx * 0.8);                  // l'iride si schiaccia quando guarda di lato
    const dx = (x - icx) / ax, dy = y - icy, d = Math.hypot(dx, dy), RI = 0.44;
    if (d < RI) {
      const rr = d / RI, pr = s.rp / RI;
      if (rr < pr) { r = 3; g = 3; b = 5; }
      else {
        const a = Math.atan2(dy, dx), t = (rr - pr) / (1 - pr);
        const fib = 0.62 + 0.22 * Math.sin(a * 29 + 2.5 * Math.sin(a * 7 + t * 4)) + 0.16 * Math.sin(a * 53 + t * 9 + 2 * Math.sin(a * 13));
        const crypt = noise(Math.cos(a) * 9 + t * 3, Math.sin(a) * 9 + t * 3);
        const m = ss(0.15, 0.55, t);                  // ambra vicino alla pupilla, verde-azzurro fuori
        r = 250 + (80 - 250) * m; g = 165 + (205 - 165) * m; b = 60 + (180 - 60) * m;
        let br = fib * (0.8 + 0.45 * crypt) * 1.7;
        br *= 1 + 0.35 * Math.exp(-((t - 0.32) ** 2) / 0.004);
        br *= 1 - 0.85 * ss(0.78, 1.0, t);
        br *= 0.5 + 0.5 * ss(0, 0.07, t);
        const spot = ss(0.74, 0.8, noise(Math.cos(a) * 4 + 7, Math.sin(a) * 4 + t * 2)) * (1 - ss(0.7, 0.85, t));
        r += (200 - r) * spot; g += (115 - g) * spot; b += (35 - b) * spot;   // macchioline ambra
        r *= br; g *= br; b *= br;
      }
    } else {
      // bianco crema, con venuzze rosse ramificate che aumentano verso gli angoli
      const v1 = 1 - ss(0, 0.03, Math.abs(noise(x * 7 + 3, y * 7) - 0.5));
      const v2 = 1 - ss(0, 0.025, Math.abs(noise(x * 15 + 9, y * 15) - 0.5));
      const vein = Math.max(v1, v2 * 0.7) * ss(0.3, 0.9, Math.abs(x));
      r = 226 - 10 * vein; g = 214 - 140 * vein; b = 205 - 130 * vein;
      const red = 0.35 * ss(0.55, 0.98, Math.abs(x));                // angoli più rosati
      r += (215 - r) * red; g += (150 - g) * red; b += (150 - b) * red;
      const car = ss(0.80, 0.97, x);                                 // caruncola: la carne rosa nell'angolo interno
      r += (220 - r) * car; g += (120 - g) * car; b += (120 - b) * car;
      const lim = 1 - 0.18 * (1 - ss(RI, RI + 0.04, d));
      r *= lim; g *= lim; b *= lim;
    }
    let sh = (0.5 + 0.5 * Math.sqrt(Math.max(0, 1 - (x * x + y * y) / 1.5)))
           * (0.5 + 0.5 * ss(0, 0.2, top - y)) * (0.75 + 0.25 * ss(0, 0.05, y - bot));   // ombra della palpebra
    r *= sh; g *= sh; b *= sh;
    // riflessi di luce (spariscono durante lo zoom)
    const hl = (1 - ss(1.3, 2.5, s.zoom)) * Math.max(1 - ss(0.03, 0.055, Math.hypot(x - icx + 0.11, y - icy - 0.12)),
                        1 - ss(0.01, 0.022, Math.hypot(x - icx - 0.08, y - icy + 0.07)));
    r += (255 - r) * hl; g += (255 - g) * hl; b += (255 - b) * hl;
    if (y - bot < 0.02) { r = r * 0.4 + 120; g = g * 0.4 + 75; b = b * 0.4 + 70; } // rima bagnata
  } else {
    // --- pelle ---
    let br;
    if (y >= top) {
      if (y < crease) {
        const lt = (y - top) / Math.max(1e-3, crease - top);
        br = (0.5 + 0.3 * Math.sin(lt * Math.PI)) * (0.55 + 0.45 * ss(0, 0.03, y - top));
      } else br = 0.35 + 0.4 * ss(0, 0.12, y - crease);
    } else {
      const dd = bot - y;
      br = 0.5 + 0.2 * ss(0, 0.08, dd) - 0.15 * Math.exp(-((dd - 0.16) ** 2) / 0.004);
    }
    br = 0.45 + 0.6 * br;                                                        // pelle chiara
    const rim = y >= top ? 0.55 * (1 - ss(0, 0.035, y - top)) : 0;
    br *= 1 - rim * Math.min(1, k * 10);                                         // bordo palpebra di sopra più scuro
    br *= 0.92 + 0.16 * noise(x * 35, y * 35);                                   // pori
    if (!s.flat) br *= 1 - 0.25 * ss(0.8, 2.0, Math.hypot(x * 0.7, y));          // un filo d'ombra ai bordi (non nell'occhietto)
    r = 232 * br; g = 176 * br; b = 152 * br;
    // bordino rosa bagnato della palpebra di sotto
    const wl = y < bot && s.o > 0.3 ? (1 - ss(0.025, 0.045, bot - y)) * Math.min(1, k * 6) : 0;
    r += (220 - r) * wl; g += (140 - g) * wl; b += (130 - b) * wl;
  }

  R = r; G = g; B = b;
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return Math.min(RAMP.length - 1, (Math.pow(L, 0.9) * RAMP.length) | 0);
}

function render(s, tick = 0, v = V) {
  const { ctx, dpr, W, H, cw, ch, cols, rows, u, rowBuf, colCv, colCtx, colImg } = v;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, W, H);
  const scale = u * s.zoom, cellW = cw / scale, data = colImg.data;
  ctx.fillStyle = '#fff';
  for (let j = 0; j < rows; j++) {
    const y = (H / 2 - (j + 0.5) * ch) / scale + s.fy;
    for (let i = 0; i < cols; i++) {
      const x = ((i + 0.5) * cw - W / 2) / scale + s.fx;
      let gi = shade(x, y, s, cellW);
      if (v.oval && Math.hypot(x / 1.3, (y - s.fy) / 0.78) > 1) gi = 0;   // occhietto: lettere solo dentro l'ovale, senza sfumarle
      const p = (j * cols + i) * 4;
      // lettere che cambiano di continuo: ogni tanto saltano a una vicina di luminosità (gli spazi vuoti restano vuoti)
      if (gi > 0 && gi < RAMP.length) gi = clamp(gi + Math.round((hash(i * 1.3 + tick * 17.1, j * 2.1 - tick * 3.7) - 0.5) * 5), 1, RAMP.length - 1);
      rowBuf[i] = GLYPHS[gi];
      // il colore sta solo nelle lettere; le ciglia marrone scuro
      const a = gi >= RAMP.length ? 1.8 : 1.25, l = 0.299 * R + 0.587 * G + 0.114 * B, sat = 1.4; // colori un po' più vivi
      data[p] = (l + (R - l) * sat) * a; data[p + 1] = (l + (G - l) * sat) * a; data[p + 2] = (l + (B - l) * sat) * a; data[p + 3] = 255;
    }
    ctx.fillText(rowBuf.join(''), 0, (j + 0.5) * ch);   // una riga intera in bianco, colorata dopo
  }
  colCtx.putImageData(colImg, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'source-in';           // colora le lettere
  ctx.drawImage(colCv, 0, 0, cols * cw, rows * ch);
  if (!v.oval) {                                        // dietro: nero tinta unita (l'occhietto ha il suo sfondo sfumato nel CSS)
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  }

  // la pupilla diventa un buco da cui si vede la pagina
  if (s.reveal > 0) {
    const pcx = W / 2 + (0 - s.fx) * scale, pcy = H / 2 - (0.08 + s.gy * 0.2 - s.fy) * scale, pr = s.rp * scale * 0.97;
    const grad = ctx.createRadialGradient(pcx, pcy, pr * 0.75, pcx, pcy, pr);
    grad.addColorStop(0, `rgba(0,0,0,${s.reveal})`); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2); ctx.fill();
    return pr * 0.75 > Math.hypot(W, H) / 2;     // la pupilla copre tutto lo schermo: fine
  }
  return false;
}


// ---- occhietto nell'angolo: guarda il cursore e ogni tanto sbatte le palpebre ----
let MV, miniRaf = 0, blinkAt = 0;
const aim = { x: 0, y: 0 }, look = { x: 0, y: 0 };
function startMini() {
  cancelAnimationFrame(miniRaf);
  const w = mini.clientWidth, h = mini.clientHeight;
  MV = makeView(mini, w, h, w < 200 ? 5 : 6, Math.min(w / 2.7, h / 1.8));   // un po' più piccolo, così gli angoli non finiscono nella sfumatura
  MV.oval = true;
  blinkAt = performance.now() + 1500;
  miniRaf = requestAnimationFrame(miniFrame);
}
function miniFrame(now) {
  look.x += (aim.x - look.x) * 0.18; look.y += (aim.y - look.y) * 0.18;   // lo sguardo segue con un attimo di ritardo
  const b = (now - blinkAt) / 200;
  if (b > 1) blinkAt = now + 2500 + Math.random() * 4000;
  const o = b < 0 || b > 1 ? 1 : Math.abs(2 * b - 1);
  render({ o, gx: look.x, gy: look.y, rp: 0.17, zoom: 1, fx: 0, fy: 0.12, reveal: 0, flat: true }, Math.floor(now / 1000 * 12), MV);
  miniRaf = requestAnimationFrame(miniFrame);
}
addEventListener('pointermove', e => {
  const r = mini.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = (r.top + r.height / 2) - e.clientY;
  aim.x = 0.75 * Math.tanh(dx / 350); aim.y = 0.45 * Math.tanh(dy / 250);
});

// ---- avvio (solo alla prima pressione del bottone) e salta ----
let start = 0, raf = 0;
const playing = () => document.body.classList.contains('occhio-play');
function frame(now) {
  const t = (now - start) / 1000 * SPEED;
  const covered = render(state(t), Math.floor((now - start) / 1000 * 12));   // 12 cambi di lettere al secondo
  if (!covered && t < END) raf = requestAnimationFrame(frame); else finish();
}
function finish() {
  cancelAnimationFrame(raf);
  document.body.classList.remove('occhio-play');
  document.body.classList.add('occhio-done');
  startMini();
}
function play() {
  document.body.classList.add('occhio-play');
  resize();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  start = performance.now();
  raf = requestAnimationFrame(frame);
}
addEventListener('resize', () => { if (playing()) resize(); if (document.body.classList.contains('occhio-done')) startMini(); });
cv.addEventListener('click', finish);
skip.addEventListener('click', finish);
addEventListener('keydown', e => { if (e.key === 'Escape' && playing()) finish(); });
document.getElementById('sputos').addEventListener('click', play, { once: true });
})();
