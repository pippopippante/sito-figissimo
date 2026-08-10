/*classe per personaggio base*/

class Pg {
  constructor(nik, ses, gun, armor, health) {
    this.nik = nik;
    this.ses = ses;
    this.gun = gun;
    this.armor = armor;
    this.health = health;
  }
}

/*creazione personaggio giocante*/

var buono = new Pg("estocle", "maschio", 10, 0, 200);

/*creazione personaggio nemico*/

var cattivo = new Pg("ermistilla", "femmina", 90, 30, 200);

function nomes() {
  var normes = document.getElementById("nik");
  var normesi = document.getElementById("normeso");
  buono.nik = normes.value;
  normesi.innerHTML = `nome: ${buono.nik}`;
}

function nomest() {
  var normes = document.getElementById("niks");
  var normesi = document.getElementById("normesos");
  cattivo.nik = normes.value;
  normesi.innerHTML = `nome: ${cattivo.nik}`;
}

/*funzioni per cambiare armi*/

let diddi = document.getElementById("armar");

let diddir = document.getElementById("armaturar");

let diddis = document.getElementById("duddu");

function cambia() {
  buono.gun = 35;
  var spitti = document.getElementById("rma");
  spitti.innerHTML = "arma: ndrangeta +35dmg";
}

function cambia1() {
  buono.gun = 75;
  var spitti = document.getElementById("rma");
  spitti.innerHTML = "arma: idrante +75dmg";
}

function cambia2() {
  buono.gun = 150;
  var spitti = document.getElementById("rma");
  spitti.innerHTML = "arma: lancia di lungino +150dmg";
}

/*funzioni per cambiare armatura*/

function cambiar() {
  buono.armor = 10;
  var spitti = document.getElementById("rmar");
  spitti.innerHTML = "armatura: ndrangeta +10armor";
  var rut = document.getElementById("dud");
}

function cambiar1() {
  buono.armor = 35;
  var spitti = document.getElementById("rmar");
  spitti.innerHTML = "armatura: tanga di godzilla +35armor";
  var rut = document.getElementById("dud");
}

function cambiar2() {
  buono.armor = 66;
  var spitti = document.getElementById("rmar");
  spitti.innerHTML = "armatura: paolo bitta +66armor";
}


/*funzione per determinare vittoria e sconfitta*/

function stiddu() {
  localStorage.setItem("buonos", JSON.stringify(buono));
  localStorage.setItem("cattivos", JSON.stringify(cattivo));

}
function pisti(){
  location.href = `LVL_1.html`;
}

setInterval(stiddu, 100);
