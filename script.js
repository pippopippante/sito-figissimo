/*funzione che compareimmagine wooo bottone magic*/

var stucco = 0;

function waaa() {
  var stu = document.getElementById("pisco");
  var sty = document.getElementById("sputos");
  if (stucco == 0) {
    stu.src =
      "https://i.pinimg.com/564x/74/8c/b7/748cb7d31f08dffddb4c2d84945f35b7.jpg";
    stucco++;
    sty.innerHTML = "Cazzo fra, He was hinding";
  } else if (stucco == 1) {
    stu.src = "";
    stucco--;
    sty.innerHTML = "cosa e' quello?";
  }
}

/*funzione che cambia la cancone tramite il cambio del atributo procedura standart tipo quello del immagine po esse anche lostesso */

var songas = 0;

function song() {
  var songa = document.getElementById("spospo");
  if (songas == 0) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/6RQjUikQBjV183yPTvrUvr?si=8bb465c119604c6e";
    songas++;
  } else if (songas == 1) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/2ItHFRAvtNL1PRl6Yr1axb?si=a074308d49984066";
    songas++;
  } else if (songas == 2) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/0pU8JuxPzLfhCtHML1zkCg?si=d82338dca9274052";
    songas++;
  } else if (songas == 3) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/0ekMehNXQgeMJXfCPrlTTf?si=40752a1279ce417c";
    songas++;
  } else if (songas == 4) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/0MnTkIEP4zZN1IUSu8MvIz?si=5c9e707cbffb4d1b";
    songas++;
  } else if (songas == 5) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/4hQz37Z88go8H8hrK7ncVz?si=ca751469cb934427";
    songas++;
  } else if (songas == 6) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/7cGDxaRthVVC4FTv14jhVY?si=034ba2c293574f23";
    songas++;
  } else if (songas == 7) {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/7nVFJe7RBT9QnLIiDs0yoQ?si=d37eddf9a8be4600";
    songas++;
  } else if (songas == 8) {
    songa.src =
      "https://open.spotify.com/embed/track/5hM5arv9KDbCHS0k9uqwjr?utm_source=generator";
    songas++;
  } else if (songas == 9) {
    songa.src =
      "https://open.spotify.com/embed/track/2cQF51lloqnIqinLnnz4fK?si=b94eed33c0b64384";
    songas++;
  } else {
    songa.src =
      "https://open.spotify.com/embed/user/spotify/track/7zZbr4MZMwX5R5hlWq31bl?si=2000584f62384293";
    songas = 0;
  }
}


/* fenice: cliccata si ingrandisce volando da destra a sinistra, sale mostrando il petto e torna dall'alto al suo posto */

var fenice = document.getElementById("fenice");
var volo = document.getElementById("volo");
var LATO = ["fenice/lato-1.png", "fenice/lato-2.png", "fenice/lato-3.png", "fenice/lato-2.png"];
var FRONTE = ["fenice/fronte-1.png", "fenice/fronte-2.png"];
LATO.concat(FRONTE).forEach(function (f) {
  new Image().src = f; // caricate prima del volo
});

// una brace che si stacca dalla fenice e si spegne
function brace() {
  var r = volo.getBoundingClientRect();
  var b = document.createElement("span");
  b.className = "brace";
  b.style.left = r.left + r.width * (0.2 + Math.random() * 0.6) + "px";
  b.style.top = r.top + r.height * (0.3 + Math.random() * 0.5) + "px";
  b.style.setProperty("--dx", (Math.random() - 0.5) * 80 + "px");
  b.style.setProperty("--dy", -40 - Math.random() * 80 + "px");
  b.onanimationend = function () {
    b.remove();
  };
  document.body.appendChild(b);
}

// un pezzo di volo: le ali sbattono coi fotogrammi mentre la fenice passa per i punti [x, y, grandezza]
// ritmo = ms fra un fotogramma e l'altro; verso -1 = guarda a sinistra (i disegni di profilo guardano a destra)
function tratto(fotogrammi, ritmo, punti, durata, verso, easing) {
  var i = 0;
  var mezzo = volo.offsetWidth / 2;
  volo.src = fotogrammi[0];
  var ali = setInterval(function () {
    volo.src = fotogrammi[++i % fotogrammi.length];
  }, ritmo);
  var braci = setInterval(brace, 35);
  var passi = punti.map(function (p) {
    return { transform: "translate(" + (p[0] - mezzo) + "px," + (p[1] - mezzo) + "px) scale(" + p[2] * verso + "," + p[2] + ")" };
  });
  return volo.animate(passi, { duration: durata, easing: easing || "linear", fill: "forwards" }).finished.then(function () {
    clearInterval(ali);
    clearInterval(braci);
  });
}

fenice.onclick = function () {
  if (volo.style.visibility == "visible") return;
  var w = innerWidth;
  var h = innerHeight;
  var r = fenice.getBoundingClientRect();
  var x0 = r.left + r.width / 2;
  var y0 = r.top + r.height / 2;
  var mezzo = volo.offsetWidth / 2;
  var piccola = r.width / volo.offsetWidth; // grande come quando è ferma
  var grande = Math.min(Math.min(w, h) * 0.9, 760) / volo.offsetWidth;
  fenice.style.visibility = "hidden";
  volo.style.visibility = "visible";
  // 1. parte e attraversa lo schermo verso sinistra, sempre più grande
  tratto(LATO, 110, [[x0, y0, piccola], [w * 0.65, h * 0.3, grande * 0.45], [w * 0.3, h * 0.35, grande * 0.8], [-mezzo * grande, h * 0.3, grande]], 2200, -1)
    // 2. sale dal basso fino in cima mostrando il petto
    .then(function () {
      return tratto(FRONTE, 170, [[w / 2, h + mezzo * grande * 0.75, grande], [w / 2, -mezzo * grande * 0.75, grande]], 1700, 1);
    })
    // 3. riscende dall'alto, più piccola, e si posa dov'era
    .then(function () {
      return tratto(LATO, 110, [[x0 + w * 0.1, -mezzo, piccola * 0.7], [x0, y0, piccola]], 1500, -1, "ease-out");
    })
    .then(function () {
      volo.style.visibility = "hidden";
      fenice.style.visibility = "visible";
    });
};
