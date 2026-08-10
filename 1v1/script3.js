const buono = JSON.parse(localStorage.getItem("buonos"));

const cattivo = JSON.parse(localStorage.getItem("cattivos"));

/*funzioni per i bottoni azzione*/
var rut = document.getElementById("dud");
rut.innerHTML = `${buono.nik} 
    ${buono.health}/200hp`;

function risposta1() {
  buono.health = buono.health - cattivo.gun + buono.armor;
  cattivo.health = cattivo.health - buono.gun + cattivo.armor;
  const attacco = document.createElement("p");
  attacco.innerHTML = `hai inflitto - ${buono.gun - cattivo.armor}hp al nemico  
     lei ti ha fatto esplodere - 
    ${cattivo.gun - buono.armor}hp`;
  document.getElementById("duddu").appendChild(attacco);
  var rut = document.getElementById("dud");
  rut.innerHTML = `${buono.nik} 
    ${buono.health}/200hp 
     ${cattivo.nik} 
    ${cattivo.health}/200hp`;
}

function risposta2() {
  cattivo.health = cattivo.health - cattivo.gun + cattivo.armor;
  const attacco = document.createElement("p");
  attacco.innerHTML = `hai colpito la bomba del nemico ed e' espola -
    ${cattivo.gun - cattivo.armor}hp al nemico `;
  document.getElementById("duddu").appendChild(attacco);
  var rut = document.getElementById("dud");
  rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp 
     ${cattivo.nik} 
    ${cattivo.health}/200hp`;
}

function risposta3() {
  buono.health = buono.health - 199;
  const attacco = document.createElement("p");
  attacco.innerHTML = "copglione non puoi shivare una bomba a idrogeno -199hp";
  document.getElementById("duddu").appendChild(attacco);
  var rut = document.getElementById("dud");
  rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp 
    ${cattivo.nik} 
    ${cattivo.health}/200hp`;
}

function risposta4() {
  cattivo.health = cattivo.health - 199;
  const attacco = document.createElement("p");
  attacco.innerHTML = "hai perryato la bomba del nemico -199hp al nemico ";
  document.getElementById("duddu").appendChild(attacco);
  var rut = document.getElementById("dud");
  rut.innerHTML = `${buono.nik} 
  ${buono.health}/200hp ${cattivo.nik} ${cattivo.health}/200hp`;
}

function stiddu() {
  localStorage.setItem("buonos", JSON.stringify(buono));
  localStorage.setItem("cattivos", JSON.stringify(cattivo));
  if (buono.health <= 0) {
    location.href = "looser.html";
  } else if (cattivo.health <= 0) {
    location.href = `win.html`;
  }
}

setInterval(stiddu, 500);
