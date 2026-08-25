/* ── Tema ─────────────────────────────────────────────────────────── */
/* sta qui e non in script.js perche' lo usa anche l'indice, che non ha
   ne' la ricerca ne' le voci */
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
