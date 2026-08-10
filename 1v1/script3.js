const buono = JSON.parse(localStorage.getItem("buonos"));

const cattivo = JSON.parse(localStorage.getItem("cattivos"));

const rut = document.getElementById("dud");

const duddu = document.getElementById("duddu");

rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp`;

/*salva e controlla se qualcuno e' morto, invece di ricontrollare
  due volte al secondo lo fa dopo ogni azzione*/

function stiddu() {
  localStorage.setItem("buonos", JSON.stringify(buono));
  localStorage.setItem("cattivos", JSON.stringify(cattivo));
  if (buono.health <= 0) {
    location.href = "looser.html";
  } else if (cattivo.health <= 0) {
    location.href = `win.html`;
  }
}

/*la parte uguale per tutte le azzioni: scrive nel log e aggiorna le vite*/

function azzione(messaggio) {
  const attacco = document.createElement("p");
  attacco.innerHTML = messaggio;
  duddu.appendChild(attacco);
  rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp
     ${cattivo.nik}
    ${cattivo.health}/200hp`;
  stiddu();
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
