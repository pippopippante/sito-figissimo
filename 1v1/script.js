/*creazione personaggio giocante*/

const buono = new Pg("estocle", "maschio", 10, 0, 200);

/*creazione personaggio nemico*/

const cattivo = new Pg("ermistilla", "femmina", 90, 30, 200);

/*salva subito, cosi' se vai al combattimento senza toccare niente
  ti ritrovi comunque i due personaggi di partenza*/

salva(buono, cattivo);

function nomes() {
  var normes = document.getElementById("nik");
  var normesi = document.getElementById("normeso");
  buono.nik = normes.value;
  normesi.innerHTML = `nome: ${buono.nik}`;
  salva(buono, cattivo);
}

function nomest() {
  var normes = document.getElementById("niks");
  var normesi = document.getElementById("normesos");
  cattivo.nik = normes.value;
  normesi.innerHTML = `nome: ${cattivo.nik}`;
  salva(buono, cattivo);
}

/*una funzione sola per tutte le armi, il danno e il nome li passa il
  bottone che la chiama*/

function cambia(gun, nome) {
  buono.gun = gun;
  var spitti = document.getElementById("rma");
  spitti.innerHTML = `arma: ${nome} +${gun}dmg`;
  salva(buono, cattivo);
}

/*stessa cosa per le armature*/

function cambiar(armor, nome) {
  buono.armor = armor;
  var spitti = document.getElementById("rmar");
  spitti.innerHTML = `armatura: ${nome} +${armor}armor`;
  salva(buono, cattivo);
}

function pisti() {
  location.href = `LVL_1.html`;
}
