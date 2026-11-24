// Imprenditores nella home: il bottone "gioca qui" apre il gioco in un riquadro nell'angolo,
// senza cambiare pagina. Se c'è l'occhietto, l'occhietto sale sopra al riquadro.
// Codice di Emanuele Parmegiani
(() => {
const css = document.createElement('style');
css.textContent = `
  :root { --gioco-h: min(800px, calc(100dvh - 32px)); }
  body.occhio-done { --gioco-h: min(800px, calc(100dvh - 218px)); }   /* lascia posto all'occhietto (170px) */
  #gioco {
    position: fixed; z-index: 997; right: 16px; bottom: 16px; width: 400px; height: var(--gioco-h);
    display: none; flex-direction: column; background: #EAE0D5; border-radius: 16px; overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,.35);
  }
  body.gioco-aperto #gioco { display: flex; }
  body.gioco-aperto #occhio-mini { bottom: calc(var(--gioco-h) + 24px); }
  #gioco .g-bar { display: flex; align-items: center; justify-content: space-between; padding-left: 14px; background: #22333B; color: #fff; font: 600 15px system-ui, sans-serif; }
  #gioco .g-x { width: 44px; height: 44px; border: 0; background: none; color: #fff; font-size: 22px; cursor: pointer; }
  #gioco .g-x:focus-visible { outline: 3px solid #FFA343; outline-offset: -3px; }
  #gioco iframe { flex: 1; width: 100%; border: 0; }
  @media (max-width: 699px) {   /* telefono: tutta la larghezza, attaccato in basso */
    :root { --gioco-h: 85dvh; }
    body.occhio-done { --gioco-h: calc(100dvh - 144px); }   /* occhietto da 112px sopra */
    #gioco { right: 8px; bottom: 8px; width: calc(100% - 16px); }
    body.gioco-aperto #occhio-mini { bottom: calc(var(--gioco-h) + 16px); }
  }
`;
document.head.appendChild(css);

const box = document.createElement('div'), btn = document.getElementById('gioca');
box.id = 'gioco'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'imprenditores');
box.innerHTML = '<div class="g-bar">imprenditores<button class="g-x" type="button" aria-label="Chiudi il gioco">&times;</button></div>';
document.body.appendChild(box);

let frame = null;
function apri(on) {
  if (on && !frame) {   // il gioco si carica al primo clic; chiudendo resta acceso sotto, come un idle
    frame = document.createElement('iframe');
    frame.src = 'fatturato/index.html'; frame.title = 'imprenditores';
    frame.addEventListener('load', sistema);
    box.appendChild(frame);
  }
  document.body.classList.toggle('gioco-aperto', on);
  btn.setAttribute('aria-expanded', on);
  (on ? frame : btn).focus();
}
btn.addEventListener('click', () => apri(!document.body.classList.contains('gioco-aperto')));
box.querySelector('.g-x').addEventListener('click', () => apri(false));

// dentro il riquadro: niente "torna indietro", riquadri larghi quanto lo spazio,
// e il cursore sopra al gioco lo vede anche l'occhietto
function sistema() {
  const d = frame.contentDocument;
  d.querySelector('a[href="../index.html"]')?.remove();
  const s = d.createElement('style');
  s.textContent = '.assumi,.potenzia{width:auto;max-width:360px}';
  d.head.appendChild(s);
  d.addEventListener('pointermove', e => {
    const r = frame.getBoundingClientRect();
    dispatchEvent(new PointerEvent('pointermove', { clientX: e.clientX + r.left, clientY: e.clientY + r.top }));
  });
}
})();
