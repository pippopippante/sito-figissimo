const { buono, cattivo } = carica();

const rut = document.getElementById("dud");

const duddu = document.getElementById("duddu");

/*scrive le vite in cima, all'inizio si vede solo la tua*/

rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp`;

/*la parte uguale a tutte e quattro le azzioni: riga nel log, vite
  aggiornate, salvataggio e controllo di chi e' morto*/

function azzione(messaggio) {
  const attacco = document.createElement("p");
  attacco.innerHTML = messaggio;
  duddu.appendChild(attacco);
  rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp
     ${cattivo.nik}
    ${cattivo.health}/200hp`;
  salva(buono, cattivo);
  if (buono.health <= 0) {
    location.href = "looser.html";
  } else if (cattivo.health <= 0) {
    location.href = `win.html`;
  }
}

/*funzioni per i bottoni azzione*/

function risposta1() {
  buono.health = buono.health - cattivo.gun + buono.armor;
  cattivo.health = cattivo.health - buono.gun + cattivo.armor;
  azzione(`hai inflitto - ${buono.gun - cattivo.armor}hp al nemico
     lei ti ha fatto esplodere -
    ${cattivo.gun - buono.armor}hp`);
}

function risposta2() {
  cattivo.health = cattivo.health - cattivo.gun + cattivo.armor;
  azzione(`hai colpito la bomba del nemico ed e' espola -
    ${cattivo.gun - cattivo.armor}hp al nemico `);
}

function risposta3() {
  buono.health = buono.health - 199;
  azzione("copglione non puoi shivare una bomba a idrogeno -199hp");
}

function risposta4() {
  cattivo.health = cattivo.health - 199;
  azzione("hai perryato la bomba del nemico -199hp al nemico ");
}
