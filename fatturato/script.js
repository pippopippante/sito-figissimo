var gg = 0;
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

/*riferimenti al dom presi una volta sola invece che a ogni aggiornamento*/

const solp = document.getElementById("soldi");
const sota = document.getElementById("sot");
const stippi = document.getElementById("stip");
const buzzonss = document.getElementById("buzzonss");
const ernisas = document.getElementById("ernisas");

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

/*quanto fattura in un secondo tutta l'azzienda messa insieme*/

function fatturato() {
  return (
    (buzi.produzione * buzi.quantita * buzi.godness) / 100 +
    (ernisa.produzione * ernisa.quantita * 2 * ernisa.godness) / 100 +
    (izuru.produzione * izuru.quantita * izuru.godness) / 100 +
    prime.produzione * prime.quantita
  );
}

/*un solo timer per la produzione di tutti invece di uno per ogni assunto*/

setInterval(produci, 1000);

function produci() {
  soldi = soldi + fatturato();
}

/*un solo loop per tutte le scritte invece di tre separati*/

setInterval(aggiornaSchermo, 100);

function aggiornaSchermo() {
  if (soldi >= 10000000) {
    solp.innerHTML = `Patrimonio: ${Math.round((soldi / 1000000) * 100) / 100}m$`;
  } else {
    solp.innerHTML = `Patrimonio: ${Math.round(soldi * 100) / 100}$`;
  }
  sota.innerHTML = `Fatturi ${fatturato()}$ al secondo`;
  stippi.innerHTML = `Pagi ${ernisas.value * ernisa.quantita + buzzonss.value * buzi.quantita}$ di stupendi al minuto`;
}

/*reparto buzi*/

function assumibuzi() {
  if (soldi >= buzi.costo) {
    soldi = soldi - buzi.costo;
    buzi.costo = buzi.costo * 2 + 10;
    var buzzozzo = document.getElementById("buzzotte");
    buzzozzo.innerHTML = `Buzi +1 costo: ${buzi.costo}$`;
    buzi.quantita++;
    var merdas = document.getElementById("merdas");
    merdas.innerHTML = "Buzi assunti:" + buzi.quantita;
  }
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
    soldi = soldi - ernisa.costo;
    ernisa.costo = ernisa.costo * 2 + 50;
    var buzzozzo = document.getElementById("ernisotta");
    buzzozzo.innerHTML = `Ernisa +1 costo: ${ernisa.costo}$`;
    ernisa.quantita++;
    var merdas = document.getElementById("divina");
    merdas.innerHTML = "Ernisa assunte:" + ernisa.quantita;
  }
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
    var stitti = document.getElementById("stitti");
    stitti.removeAttribute("hidden");
  }
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
}

function stipendi() {
  var buzzonssold = Number(buzzonss.value);
  var ernisasol = Number(ernisas.value);
  var totale = buzzonssold * buzi.quantita + ernisasol * ernisa.quantita;
  if (soldi - totale < 0) {
    location.href = "looser.html";
  }
  soldi = soldi - totale;

  sostegnistatali();

  if (buzzonssold >= 65) {
    buzi.godness = 145;
  } else if (buzzonssold >= 50) {
    buzi.godness = Math.round(0.2 * Math.pow(buzzonssold - 50, 2) + 100);
  } else if (buzzonssold >= 40) {
    buzi.godness = Math.round(100 - 0.25 * Math.pow(buzzonssold - 50, 2));
  } else {
    buzi.godness = 75;
  }

  var buzigosd = document.getElementById("buzigos");
  buzigosd.innerHTML = `Produttivita: ${buzi.godness}%`;

  if (ernisasol >= 1200) {
    ernisa.godness = 130;
  } else if (ernisasol >= 1000) {
    ernisa.godness = Math.round(0.00075 * Math.pow(ernisasol - 1000, 2) + 100);
  } else if (ernisasol >= 800) {
    ernisa.godness = Math.round(100 - 0.0005 * Math.pow(ernisasol - 1000, 2));
  } else {
    ernisa.godness = 0;
  }

  var ernisagosd = document.getElementById("ernisagos");
  ernisagosd.innerHTML = `Produttivita: ${ernisa.godness}%`;
}
/*g: ernisasol=0.0001(1200-1000)^(2),*/

/*tempo mancante per prossiomo pagamento stipendi */

setInterval(mancas, 1000);

const secco = document.getElementById("seconds");
var sec = 60;
function mancas() {
  sec--;
  secco.innerHTML = `Secondi al prossimo stipendio:${sec}`;
  if (sec == 0) {
    sec = 60;
    stipendi();
  }
}

/*creazione debito */

const tempos = document.getElementById("tempos");
const debit = document.getElementById("debit");
var nunu = 0;
var money = 0;
var min = 5;
var seccc = 0;

function debito() {
  money = Number(debit.value);
  if (nunu === 0) {
    soldi = soldi + money;
    nunu++;
    min = 2;
    seccc = 0;
    timer();
  }
}

/*scadenza debito */

function timer() {
  const timerID = setInterval(() => {
    if (seccc == 0) {
      seccc = 60;
      min--;
    }
    seccc--;
    if (min == -1) {
      mannaia();
      clearInterval(timerID);
    } else if (seccc < 10) {
      tempos.innerHTML = `${min}:0${seccc} minuti al addebito`;
    } else {
      tempos.innerHTML = `${min}:${seccc} minuti al addebito`;
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