/* ── Tema ─────────────────────────────────────────────────────────── */
const tasto = document.getElementById('tema');
const salvato = localStorage.getItem('tema-analisi');
if (salvato) document.documentElement.dataset.tema = salvato;

function scuroAdesso() {
  const t = document.documentElement.dataset.tema;
  if (t) return t === 'scuro';
  return matchMedia('(prefers-color-scheme:dark)').matches;
}
function segnaTasto() { tasto.textContent = scuroAdesso() ? '☀️' : '🌙'; }
segnaTasto();

tasto.addEventListener('click', () => {
  const nuovo = scuroAdesso() ? 'chiaro' : 'scuro';
  document.documentElement.dataset.tema = nuovo;
  localStorage.setItem('tema-analisi', nuovo);
  segnaTasto();
});

/* ── Ricerca ──────────────────────────────────────────────────────── */
const campo = document.getElementById('cerca');
const voci = [...document.querySelectorAll('.voce')];
const ricette = [...document.querySelectorAll('.ricetta')];
const etichette = [...document.querySelectorAll('.et')];
const niente = document.getElementById('niente');

function normalizza(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

// ogni voce si cerca anche col testo della sua ricetta: nome, quando si usa, etichetta
const indice = voci.map(v => {
  const ric = v.closest('.ricetta');
  const quando = ric.querySelector('.quando');
  const prec = v.previousElementSibling;
  const et = prec && prec.classList.contains('et') ? prec.textContent : '';
  return normalizza([
    ric.querySelector('.testata').textContent,
    quando ? quando.textContent : '',
    et,
    v.textContent
  ].join(' '));
});

// sinonimi: quello che scrivi != quello che c'e' scritto nella ricetta
const alias = {
  'ln': 'logaritmo log', 'log': 'ln logaritmo', 'e': 'esponenziale',
  'sen': 'sin seno goniometrica', 'sin': 'sen seno goniometrica',
  'cos': 'coseno goniometrica', 'tan': 'arctan tangente',
  'radice': '√ arcsin', 'frazione': 'fratta fratte', 'frazioni': 'fratte',
  'parti': 'per parti', 'delta': 'Δ', 'infinito': '∞ impropri',
  'converge': 'impropri', 'diverge': 'impropri'
};

let cercavo = false;

campo.addEventListener('input', () => {
  const q = normalizza(campo.value).trim();
  // quando inizi a cercare risali in cima, se no i risultati restano fuori schermo
  if (q && !cercavo) window.scrollTo({ top: 0 });
  cercavo = !!q;

  if (!q) {
    voci.forEach(v => v.classList.remove('vuota'));
    etichette.forEach(e => e.classList.remove('vuota'));
    ricette.forEach(r => r.classList.remove('vuota'));
    niente.style.display = 'none';
    return;
  }

  const pezzi = q.split(' ').filter(Boolean);
  // normalizza anche i sinonimi, se no 'delta' non trova la Δ delle voci
  const espansi = pezzi.map(p => normalizza(p + ' ' + (alias[p] || '')));

  let trovati = 0;
  voci.forEach((v, i) => {
    const testo = indice[i];
    const ok = espansi.every(gruppo =>
      gruppo.split(' ').filter(Boolean).some(parola => testo.includes(parola))
    );
    v.classList.toggle('vuota', !ok);
    if (ok) trovati++;
  });

  // nascondi le etichette (formule / procedimento / esempio) rimaste senza voci sotto
  etichette.forEach(et => {
    let n = et.nextElementSibling, viva = false;
    while (n && !n.classList.contains('et')) {
      if (n.classList.contains('voce') && !n.classList.contains('vuota')) { viva = true; break; }
      n = n.nextElementSibling;
    }
    et.classList.toggle('vuota', !viva);
  });

  ricette.forEach(r => r.classList.toggle('vuota', !r.querySelector('.voce:not(.vuota)')));
  niente.style.display = trovati ? 'none' : 'block';
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== campo) {
    e.preventDefault();
    campo.focus();
    campo.select();
  }
  if (e.key === 'Escape') {
    if (velo.classList.contains('apri')) return chiudiVelo();
    if (document.activeElement === campo) {
      campo.value = '';
      campo.dispatchEvent(new Event('input'));
      campo.blur();
    }
  }
});

/* ── Scan (foto originali) ────────────────────────────────────────── */
const velo = document.getElementById('velo');
const veloImg = document.getElementById('velo-img');

function chiudiVelo() {
  velo.classList.remove('apri');
  veloImg.removeAttribute('src');
}

document.querySelectorAll('.scan').forEach(b => {
  b.addEventListener('click', () => {
    veloImg.src = encodeURI(b.dataset.scan);
    velo.classList.add('apri');
  });
});
velo.addEventListener('click', chiudiVelo);

/* ── Chip: evidenzia la ricetta in cui sei ────────────────────────── */
const chips = [...document.querySelectorAll('nav.chip a')];
const osservatore = new IntersectionObserver(righe => {
  righe.forEach(r => {
    if (!r.isIntersecting) return;
    chips.forEach(a => a.classList.toggle('qui', a.hash === '#' + r.target.id));
  });
}, { rootMargin: '-25% 0px -65% 0px' });
ricette.forEach(r => osservatore.observe(r));
