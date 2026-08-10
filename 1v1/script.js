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

/*salva i due personaggi: si chiama solo quando cambia qualcosa,
  invece di riscrivere il localStorage dieci volte al secondo*/

function stiddu() {
  localStorage.setItem("buonos", JSON.stringify(buono));
  localStorage.setItem("cattivos", JSON.stringify(cattivo));
}

stiddu();

function nomes() {
  var normes = document.getElementById("nik");
  var normesi = document.getElementById("normeso");
  buono.nik = normes.value;
  normesi.innerHTML = `nome: ${buono.nik}`;
  stiddu();
}

function nomest() {
  var normes = document.getElementById("niks");
  var normesi = document.getElementById("normesos");
  cattivo.nik = normes.value;
  normesi.innerHTML = `nome: ${cattivo.nik}`;
  stiddu();
}

/*funzione unica per cambiare arma, il danno e il nome li passa il bottone*/

function cambia(gun, nome) {
  buono.gun = gun;
  var spitti = document.getElementById("rma");
  spitti.innerHTML = `arma: ${nome} +${gun}dmg`;
  stiddu();
}

/*stessa cosa per l'armatura*/

function cambiar(armor, nome) {
  buono.armor = armor;
  var spitti = document.getElementById("rmar");
  spitti.innerHTML = `armatura: ${nome} +${armor}armor`;
  stiddu();
}

function pisti() {
  location.href = `LVL_1.html`;
}
