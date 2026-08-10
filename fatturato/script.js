var gg = 0;
var punteggio = 0;
function colore() {
  var gionnis = document.querySelector("link");
  if (gg == 0) {
    gionnis.href = "scuros.css";
    gg++;
  } else if (gg == 1) {
    gionnis.href = "fatto_bene.css";
    gg++;
  } else if (gg == 2) {
    gionnis.href = "dudd.css";
    gg++;
  } else {
    gionnis.href = "style.css";
    gg = 0;
  }
}

function colorebuzi() {
  var gionnis = document.querySelector("link");
  gionnis.href = "buzzo.css";
}

var soldi = 0;
const solp = document.querySelector("p");

/*crea dipendenti*/

class dipendente {
  constructor(
    costo,
    produzione,
    quantita,
    stipendio,
    livello,
    costolivello,
    godness,
  ) {
    this.costo = costo;
    this.produzione = produzione;
    this.quantita = quantita;
    this.stipendio = stipendio;
    this.livello = livello;
    this.costolivello = costolivello;
    this.godness = godness;
  }
}

var buzi = new dipendente(0, 1, 0, 50, 0, 10, 100);

var ernisa = new dipendente(150, 15, 0, 1000, 0, 10000, 100);

var izuru = new dipendente(150, -50, 0, 7500, 0, 300, 100);

var prime = new dipendente(100000, 0, 0, 0, 0, 50000, 100);

/*cambia nome azzienda*/

function cambianomes() {
  var nomes = document.getElementById("nomes");
  var normes = document.getElementById("normes").value;
  nomes.innerHTML = `${normes} S.R.L`;
  if (normes == "sordis") {
    soldi = 10000000;
  }
}

/*aggiorna la quantitadi soldi*/

setInterval(patrimonio, 100);

function patrimonio() {
  if (soldi >= 10000000) {
    solp.innerHTML = `Patrimonio: ${Math.round((soldi / 1000000) * 100) / 100}m$`;
  } else {
    solp.innerHTML = `Patrimonio: ${Math.round(soldi * 100) / 100}$`;
  }
}

/*aggiorna la fatturazione al secondo*/

setInterval(fatturato, 100);

function fatturato() {
  var sota = document.getElementById("sot");
  sota.innerHTML = `Fatturi ${(buzi.produzione * buzi.quantita * buzi.godness) / 100 + (ernisa.produzione * ernisa.quantita * 2 * ernisa.godness) / 100 + (izuru.produzione * izuru.quantita * izuru.godness) / 100 + prime.produzione * prime.quantita}$ al secondo`;
}

/*reparto buzi*/

function assumibuzi() {
  if (soldi >= buzi.costo) {
    setInterval(buziproduce, 1000);
    soldi = soldi - buzi.costo;
    buzi.costo = buzi.costo * 2 + 10;
    var buzzozzo = document.getElementById("buzzotte");
    buzzozzo.innerHTML = `Buzi +1 costo: ${buzi.costo}$`;
    buzi.quantita++;
    var merdas = document.getElementById("merdas");
    merdas.innerHTML = "Buzi assunti:" + buzi.quantita;
  }
}

function buziproduce() {
  soldi = soldi + (buzi.produzione * buzi.godness) / 100;
  punteggio = punteggio + (buzi.produzione * buzi.godness) / 100;
}

function buzipotenzia() {
  if (soldi >= buzi.costolivello) {
    buzi.produzione = buzi.produzione + 1;
    soldi = soldi - buzi.costolivello;
    buzi.costolivello = Math.round(buzi.costolivello * 1.5 + 40 * 1) / 1;
    var buzzozzos = document.getElementById("buzzottet");
    buzzozzos.innerHTML = `+1 lvl Buzi costo: ${buzi.costolivello}$`;
    buzi.livello++;
    var merda = document.getElementById("merda");
    merda.innerHTML = `Buzi lvl: ${buzi.livello}`;
  }
}

/*reparto ernisa*/

function assumiernisa() {
  if (soldi >= ernisa.costo) {
    setInterval(ernisaproduci, 500);
    soldi = soldi - ernisa.costo;
    ernisa.costo = ernisa.costo * 2 + 50;
    var buzzozzo = document.getElementById("ernisotta");
    buzzozzo.innerHTML = `Ernisa +1 costo: ${ernisa.costo}$`;
    ernisa.quantita++;
    var merdas = document.getElementById("divina");
    merdas.innerHTML = "Ernisa assunte:" + ernisa.quantita;
  }
}

function ernisaproduci() {
  soldi = soldi + (ernisa.produzione * ernisa.godness) / 100;
  punteggio = punteggio + (ernisa.produzione * ernisa.godness) / 100;
}

function ernisapotenzia() {
  if (soldi >= ernisa.costolivello) {
    ernisa.produzione = ernisa.produzione + 15;
    soldi = soldi - ernisa.costolivello;
    ernisa.costolivello = Math.round(ernisa.costolivello * 1.5 + 500 * 1) / 1;
    var buzzozzos = document.getElementById("ernisatet");
    buzzozzos.innerHTML = `+1 lvl Ernisa costo: ${ernisa.costolivello}$ `;
    ernisa.livello++;
    var merdatta = document.getElementById("didivivi");
    merdatta.innerHTML = `Ernisa lvl: ${ernisa.livello}`;
  }
}

/*reparto izuru*/

function assumiizuru() {
  if (soldi >= izuru.costo) {
    setInterval(izuruproduce, 1000);
    soldi = soldi - izuru.costo;
    izuru.costo = izuru.costo * 2 + 50;
    var buzzozzo = document.getElementById("izuzzu");
    buzzozzo.innerHTML = `Izuru +1 costo: ${izuru.costo}$`;
    izuru.quantita++;
    var merdas = document.getElementById("fernando");
    merdas.innerHTML = "Izuru assunti:" + izuru.quantita;
    var spacc = document.getElementById("spacc");
    var spac = document.getElementById("spac");
    spacc.removeAttribute("hidden");
    spac.innerHTML = `Sostegni statali: ${izuru.stipendio * izuru.quantita}$ al minuto`;
  }
}

function izuruproduce() {
  soldi = soldi + izuru.produzione;
}

function izurupotenzia() {
  if (soldi >= izuru.costolivello) {
    izuru.produzione = izuru.produzione - 50;
    soldi = soldi - izuru.costolivello;
    izuru.costolivello = izuru.costolivello * 2 - 100;
    var buzzozzos = document.getElementById("izurutet");
    buzzozzos.innerHTML = `+1 lvl Izuru costo: ${izuru.costolivello}$`;
    izuru.livello++;
    var merdatta = document.getElementById("fernandos");
    merdatta.innerHTML = `Izuru lvl: ${izuru.livello}`;
  }
}

/*reparto prime*/

function assumiprime() {
  if (soldi >= prime.costo) {
    soldi = soldi - prime.costo;
    prime.costo = prime.costo * 2 + 50000;
    var buzzozzo = document.getElementById("primezza");
    buzzozzo.innerHTML = `Prime +1 costo: ${prime.costo}$`;
    prime.quantita++;
    var merdas = document.getElementById("primuzu");
    merdas.innerHTML = "Prime assunti:" + prime.quantita;
    setInterval(primeproduce, 1000);
    var stitti = document.getElementById("stitti");
    stitti.removeAttribute("hidden");
  }
}

function primeproduce() {
  soldi = soldi + prime.produzione;
  punteggio = punteggio + prime.produzione;
}

function primepotenzia() {
  if (soldi >= prime.costolivello) {
    soldi = soldi - prime.costolivello;
    prime.costolivello = prime.costolivello * 2;
    var buzzozzos = document.getElementById("primetet");
    buzzozzos.innerHTML = `+1 lvl Prime costo: ${prime.costolivello}$`;
    prime.livello++;
    var merda = document.getElementById("primezus");
    merda.innerHTML = `Prime lvl: ${prime.livello}`;
    if (prime.livello >= 5) {
      prime.produzione = prime.produzione + 100000;
      var primess = document.getElementById("primess");
      primess.innerHTML = `Il prime si e' svegliato 😡`;
    }
  }
}

/*gestione/paga stipendi */

function sostegnistatali() {
  soldi = soldi + izuru.stipendio * izuru.quantita;
  punteggio = punteggio + izuru.stipendio * izuru.quantita;
}

function stipendi() {
  var buzzonssold = document.getElementById("buzzonss").value;
  var ernisasol = document.getElementById("ernisas").value;
  if (soldi - buzzonssold * buzi.quantita - ernisasol * ernisa.quantita < 0) {
    location.href = "looser.html";
  }
  soldi = soldi - buzzonssold * buzi.quantita - ernisasol * ernisa.quantita;

  sostegnistatali();

  if (buzzonssold >= 65) {
    buzi.godness = 145;
  } else if ((buzzonssold < 65) & (buzzonssold >= 50)) {
    buzi.godness = Math.pow(buzzonssold - 50, 2);
    buzi.godness = Math.round((0.2 * buzi.godness + 100) * 1) / 1;
  } else if ((buzzonssold <= 50) & (buzzonssold >= 40)) {
    buzi.godness = Math.pow(buzzonssold - 50, 2);
    buzi.godness = Math.round((100 - 0.25 * buzi.godness) * 1) / 1;
  } else if (buzzonssold < 800) {
    buzi.godness = 75;
  }

  var buzigosd = document.getElementById("buzigos");
  buzigosd.innerHTML = `Produttivita: ${buzi.godness}%`;

  if (ernisasol >= 1200) {
    ernisa.godness = 130;
  } else if ((ernisasol < 1200) & (ernisasol >= 1000)) {
    ernisa.godness = Math.pow(ernisasol - 1000, 2);
    ernisa.godness = Math.round((0.00075 * ernisa.godness + 100) * 1) / 1;
  } else if ((ernisasol <= 1000) & (ernisasol >= 800)) {
    ernisa.godness = Math.pow(ernisasol - 1000, 2);
    ernisa.godness = Math.round((100 - 0.0005 * ernisa.godness) * 1) / 1;
  } else if (ernisasol < 800) {
    ernisa.godness = 0;
  }

  var ernisagosd = document.getElementById("ernisagos");
  ernisagosd.innerHTML = `Produttivita: ${ernisa.godness}%`;
}

/*costo complessivo stipendi */

setInterval(stipendisc, 100);

function stipendisc() {
  var buzzonssold = document.getElementById("buzzonss").value;
  var ernisasol = document.getElementById("ernisas").value;
  var stippi = document.getElementById("stip");
  stippi.innerHTML = `Pagi ${ernisasol * ernisa.quantita + buzzonssold * buzi.quantita}$ di stupendi al minuto`;
}
/*g: ernisasol=0.0001(1200-1000)^(2),*/

/*tempo mancante per prossiomo pagamento stipendi */

setInterval(mancas, 1000);

var sec = 60;
function mancas() {
  var secco = document.getElementById("seconds");
  sec--;
  secco.innerHTML = `Secondi al prossimo stipendio:${sec}`;
  if (sec == -0) {
    sec = 60;
    stipendi();
  }
}

/*creazione debito */

var nunu = 0;
var money = 0;
function debito() {
  money = document.getElementById("debit").value;
  if (nunu === 0) {
    soldi = soldi + money * 1;
    nunu++;
    min = 2;
    seccc = 0;
    timer();
  }
}

/*scadenza debito */
var min = 5;
var seccc = 0;
var tempos = document.getElementById("tempos");
function timer() {
  const timerID = setInterval(() => {
    if (seccc == 0) {
      seccc = 60;
      min--;
    }
    seccc--;
    if (seccc < 10) {
      tempos.innerHTML = `${min}:0${seccc} minuti al addebito`;
    } else {
      tempos.innerHTML = `${min}:${seccc} minuti al addebito`;
    }
    if (min == -1) {
      mannaia();
      tempos.innerHTML = `Debito saldato`;
      clearInterval(timerID);
    }
  }, 1000);
}

/*riscossione debito */

function mannaia() {
  if (soldi - money >= 0) {
    soldi = soldi - (money * 120) / 100;
    nunu = 0;
  } else {
    soldi = soldi - money * 5;
  }
  tempos.innerHTML = `Debito saldato`;
}

function sbloccaafrica() {
  if (soldi >= 150000) {
    soldi = soldi - 150000;
    var africaass = document.getElementById("africaass");
    africaass.removeAttribute("hidden");
    var africapot = document.getElementById("africapot");
    africapot.removeAttribute("hidden");
  }
}