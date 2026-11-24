// Imprenditores nella home: il bottone "gioca qui" apre il gioco dentro la pagina, senza cambiare pagina.
// Computer: nell'angolo in basso a destra, la pagina gli lascia spazio; se c'è l'occhietto, sta sopra al gioco.
// Telefono: sotto al bottone, nel mezzo della pagina.
// Codice di Emanuele Parmegiani
(() => {
const css = document.createElement('style');
css.textContent = `
  /* chiuso resta nascosto (visibility) solo a fine animazione, così si vede scendere */
  #gioco { display: block; visibility: hidden; border: 0; width: 100%; height: 0; background: transparent;
    transition: height .35s ease, transform .35s ease, visibility 0s .35s; }
  body.gioco-aperto #gioco { visibility: visible; height: 80dvh; transition: height .35s ease, transform .35s ease; }
  @media (min-width: 700px) {
    :root { --gioco-h: min(640px, 100dvh); }
    body.occhio-done { --gioco-h: min(640px, calc(100dvh - 194px)); }   /* lascia posto all'occhietto (170px) */
    /* attaccato ai bordi; sale dal basso e l'occhietto viene spinto su insieme */
    #gioco { position: fixed; right: 0; bottom: 0; width: 320px; height: var(--gioco-h); transform: translateY(100%); }
    body.gioco-aperto #gioco { height: var(--gioco-h); transform: none; }
    body { transition: padding-right .35s ease; }
    body.gioco-aperto { padding-right: 336px; }                          /* la pagina non ci finisce sotto */
    #occhio-mini { transition: bottom .35s ease; }
    body.gioco-aperto #occhio-mini { bottom: calc(var(--gioco-h) + 8px); }
  }
  @media (prefers-reduced-motion: reduce) { #gioco, body, #occhio-mini { transition: none !important; } }
`;
document.head.appendChild(css);

const btn = document.getElementById('gioca'), frame = document.createElement('iframe');
frame.id = 'gioco'; frame.title = 'imprenditores';
frame.addEventListener('load', sistema);
btn.nextElementSibling.after(frame);   // dopo l'a capo del bottone: sul telefono compare lì

btn.addEventListener('click', () => {
  if (!frame.src) frame.src = 'fatturato/index.html';   // si carica al primo clic; chiuso resta acceso sotto, come un idle
  const on = document.body.classList.toggle('gioco-aperto');
  btn.setAttribute('aria-expanded', on);
  btn.textContent = on ? 'chiudi gioco' : 'gioca qui';
});

// dentro il gioco: niente "torna indietro" né barra di scorrimento,
// riquadri larghi quanto lo spazio, e il cursore sopra al gioco lo vede anche l'occhietto
function sistema() {
  const d = frame.contentDocument;
  d.querySelector('a[href="../index.html"]')?.remove();
  const s = d.createElement('style');
  s.textContent = 'html{scrollbar-width:none}.assumi,.potenzia{width:auto;max-width:360px}';
  d.head.appendChild(s);
  // ponytail: deciso al caricamento, se si passa da computer a telefono senza ricaricare resta com'era
  if (matchMedia('(min-width: 700px)').matches) d.documentElement.style.zoom = 0.8;   // su computer tutto il 20% più piccolo
  d.addEventListener('pointermove', e => {
    const r = frame.getBoundingClientRect();
    dispatchEvent(new PointerEvent('pointermove', { clientX: e.clientX + r.left, clientY: e.clientY + r.top }));
  });
}
})();
