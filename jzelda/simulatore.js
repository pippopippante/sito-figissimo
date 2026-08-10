/* Il simulatore del dungeon: rifa in javascript la generazione
   casuale di DungeonMap, java.util.Random compreso.
   Non ha niente in comune con guida.js a parte questa scorciatoia. */

(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };

/* ══════════════════════════════════════════════════════════════════ */
/* Simulatore: port di DungeonMap.generaCasuale                        */
/* ══════════════════════════════════════════════════════════════════ */

/* java.util.Random — LCG a 48 bit, identico bit per bit */
var MASK48 = (1n << 48n) - 1n, MUL = 0x5DEECE66Dn;
function JavaRandom(seme) { this.seme = (BigInt(seme) ^ MUL) & MASK48; }
JavaRandom.prototype.next = function (bit) {
  this.seme = (this.seme * MUL + 0xBn) & MASK48;
  return Number(this.seme >> (48n - BigInt(bit)));
};
JavaRandom.prototype.nextInt = function (limite) {
  if ((limite & -limite) === limite) return Number((BigInt(limite) * BigInt(this.next(31))) >> 31n);
  var bit, val;
  do { bit = this.next(31); val = bit % limite; } while (((bit - val + (limite - 1)) | 0) < 0);
  return val;
};

/* String.hashCode + ordine di iterazione di java.util.HashMap.
   Sotto le 12 chiavi la tabella resta a 16 bucket e non viene mai
   ridimensionata: l'ordine è quindi deterministico e riproducibile. */
function hashCode(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
function ordineHashMap(inserimento) {
  var bucket = [], i;
  for (i = 0; i < 16; i++) bucket.push([]);
  inserimento.forEach(function (k) {
    var h = hashCode(k);
    bucket[(h ^ (h >>> 16)) & 15].push(k);
  });
  return [].concat.apply([], bucket);
}

var DIREZIONI = [[-1, 0], [1, 0], [0, -1], [0, 1]];
var NORMALI = [];
for (var i = 1; i <= 30; i++) NORMALI.push("level" + (i < 10 ? "0" : "") + i);
var POOL = { INIZIO: ["Iniziale"], NEGOZIO: ["Negozio"], TESORO: ["Tesoro"], USCITA: ["Scale"] };

/* Genera un piano registrando ogni passo, per il modo passo-passo. */
function generaPiano(seme) {
  var rng = new JavaRandom(seme), tr = [];
  var ordine = ["0,0"], stanze = { "0,0": true }, occupate = [[0, 0]];

  var target = 6 + rng.nextInt(4);
  tr.push({ t: "via", target: target });
  var tentativi = 0;
  while (occupate.length < target && tentativi < 500) {
    var da = occupate[rng.nextInt(occupate.length)];
    var d = DIREZIONI[rng.nextInt(DIREZIONI.length)];
    var nr = da[0] + d[0], nc = da[1] + d[1], k = nr + "," + nc;
    var ok = !stanze[k];
    if (ok) { stanze[k] = true; ordine.push(k); occupate.push([nr, nc]); }
    tentativi++;
    tr.push({ t: "passo", da: da[0] + "," + da[1], a: k, ok: ok, n: occupate.length, tent: tentativi });
  }

  /* BFS dalla stanza 1 */
  var dist = { "0,0": 0 }, ordineDist = ["0,0"], coda = [[0, 0]];
  tr.push({ t: "bfs-via" });
  while (coda.length) {
    var att = coda.shift(), dd = dist[att[0] + "," + att[1]];
    for (var j = 0; j < 4; j++) {
      var r2 = att[0] + DIREZIONI[j][0], c2 = att[1] + DIREZIONI[j][1], k2 = r2 + "," + c2;
      if (stanze[k2] && !(k2 in dist)) {
        dist[k2] = dd + 1; ordineDist.push(k2); coda.push([r2, c2]);
        tr.push({ t: "bfs", k: k2, d: dd + 1 });
      }
    }
  }

  var max = 0;
  ordineDist.forEach(function (k) { if (dist[k] > max) max = dist[k]; });
  var candidate = ordineHashMap(ordineDist).filter(function (k) { return dist[k] === max; });
  tr.push({ t: "candidate", max: max, lista: candidate });

  var kUscita = candidate[rng.nextInt(candidate.length)];
  tr.push({ t: "tipo", k: kUscita, tipo: "USCITA" });

  var restanti = ordineHashMap(ordine).filter(function (k) { return k !== "0,0" && k !== kUscita; });
  if (restanti.length) {
    tr.push({ t: "tipo", k: restanti.splice(rng.nextInt(restanti.length), 1)[0], tipo: "NEGOZIO" });
  }
  if (restanti.length) {
    tr.push({ t: "tipo", k: restanti.splice(rng.nextInt(restanti.length), 1)[0], tipo: "TESORO" });
  }

  var tipoDi = { "0,0": "INIZIO" };
  tr.forEach(function (e) { if (e.t === "tipo") tipoDi[e.k] = e.tipo; });
  ordineHashMap(ordine).forEach(function (k) {
    var tipo = tipoDi[k] || "NORMALE";
    var pool = POOL[tipo] || NORMALI;
    tr.push({ t: "tpl", k: k, file: pool[rng.nextInt(pool.length)] });
  });
  tr.push({ t: "fine", tentativi: tentativi, stanze: ordine.length, max: max });
  return tr;
}

/* Ricostruisce lo stato dopo i primi k+1 eventi. */
function statoAl(tr, k) {
  var st = { celle: {}, dist: {}, tipo: { "0,0": "INIZIO" }, tpl: {}, evid: {},
             fase: "Random walk", msg: "", tent: 0, stanze: 1, max: null, target: 0 };
  st.celle["0,0"] = true;
  for (var i = 0; i <= k && i < tr.length; i++) {
    var e = tr[i];
    if (e.t === "via") {
      st.target = e.target;
      st.msg = "Il generatore decide di fare <b>" + e.target + " stanze</b> " +
               "(<code>6 + rng.nextInt(4)</code>). Si parte dalla cella <b>0,0</b>, che è sempre la stanza 1.";
    } else if (e.t === "passo") {
      st.tent = e.tent; st.stanze = e.n; st.evid = {};
      if (e.ok) {
        st.celle[e.a] = true; st.evid[e.a] = "nuova";
        st.msg = "Tentativo " + e.tent + ": da <b>" + e.da + "</b> verso <b>" + e.a +
                 "</b> → cella libera, <b>occupata</b>. Stanze: " + e.n + "/" + st.target + ".";
      } else {
        st.evid[e.a] = "scarto";
        st.msg = "Tentativo " + e.tent + ": da <b>" + e.da + "</b> verso <b>" + e.a +
                 "</b> → già occupata, si <b>scarta</b> e si riprova. Il contatore avanza comunque.";
      }
    } else if (e.t === "bfs-via") {
      st.fase = "BFS dall'ingresso"; st.dist["0,0"] = 0; st.evid = {};
      st.msg = "Random walk finito: <b>" + st.stanze + " stanze</b> in " + st.tent +
               " tentativi. Ora una <b>visita in ampiezza</b> dalla stanza 1 misura la distanza di ognuna.";
    } else if (e.t === "bfs") {
      st.dist[e.k] = e.d; st.evid = {}; st.evid[e.k] = "nuova";
      st.msg = "La stanza <b>" + e.k + "</b> è a <b>distanza " + e.d + "</b> dall'ingresso.";
    } else if (e.t === "candidate") {
      st.max = e.max; st.evid = {};
      e.lista.forEach(function (k) { st.evid[k] = "cand"; });
      st.fase = "Scelta dell'uscita";
      st.msg = "Distanza massima: <b>" + e.max + "</b>. Le candidate a ospitare le scale sono <b>" +
               e.lista.length + "</b> (evidenziate). Una viene scelta a caso fra queste — " +
               "<b>mai</b> fra tutte le stanze, altrimenti l'uscita potrebbe capitare accanto all'ingresso.";
    } else if (e.t === "tipo") {
      st.tipo[e.k] = e.tipo; st.evid = {}; st.evid[e.k] = "nuova";
      st.fase = "Stanze speciali";
      if (e.tipo === "USCITA") st.msg = "Le <b>scale</b> vanno in <b>" + e.k + "</b>, a distanza massima dall'ingresso.";
      if (e.tipo === "NEGOZIO") st.msg = "Il <b>negozio</b> va in <b>" + e.k + "</b>, pescato fra le stanze rimaste (escluse partenza e uscita).";
      if (e.tipo === "TESORO") st.msg = "Il <b>tesoro</b> va in <b>" + e.k + "</b>. I due <code>if (!rimanenti.isEmpty())</code> evitano <code>rng.nextInt(0)</code>, che lancerebbe un'eccezione.";
    } else if (e.t === "tpl") {
      st.tpl[e.k] = e.file; st.evid = {}; st.evid[e.k] = "nuova";
      st.fase = "Template";
      st.msg = "Alla stanza <b>" + e.k + "</b> tocca il template <b>" + e.file +
               ".txt</b>. La scelta si fa <b>una volta sola per piano</b>: rientrando, la stanza è identica.";
    } else if (e.t === "fine") {
      st.evid = {}; st.fase = "Piano pronto";
      st.msg = "<b>" + e.stanze + " stanze</b>, generate in " + e.tentativi +
               " tentativi di random walk. L'uscita è a distanza <b>" + e.max +
               "</b>. Il piano è connesso <b>per costruzione</b>: ogni stanza è nata attaccata a una già raggiungibile.";
    }
  }
  return st;
}

var CLASSE = { INIZIO: "sv-acc", NEGOZIO: "sv-oro", TESORO: "sv-blu", USCITA: "sv-rosso", NORMALE: "sv-scatola" };
var ETICHETTA = { INIZIO: "inizio", NEGOZIO: "negozio", TESORO: "tesoro", USCITA: "scale" };

function disegna(st) {
  var chiavi = Object.keys(st.celle);
  var rr = chiavi.map(function (k) { return +k.split(",")[0]; });
  var cc = chiavi.map(function (k) { return +k.split(",")[1]; });
  var minR = Math.min.apply(null, rr), maxR = Math.max.apply(null, rr);
  var minC = Math.min.apply(null, cc), maxC = Math.max.apply(null, cc);
  var W = 88, H = 66, G = 12, P = 10;
  var larg = (maxC - minC + 1) * (W + G) - G + P * 2;
  var alt = (maxR - minR + 1) * (H + G) - G + P * 2;
  var s = '<svg viewBox="0 0 ' + larg + " " + alt + '" role="img" ' +
          'aria-label="Piano generato: ' + chiavi.length + ' stanze">';

  /* porte fra stanze adiacenti */
  chiavi.forEach(function (k) {
    var p = k.split(","), r = +p[0], c = +p[1];
    var x = P + (c - minC) * (W + G), y = P + (r - minR) * (H + G);
    if (st.celle[r + "," + (c + 1)]) {
      s += '<rect x="' + (x + W) + '" y="' + (y + H / 2 - 5) + '" width="' + G +
           '" height="10" fill="var(--tenue)" opacity=".45"/>';
    }
    if (st.celle[(r + 1) + "," + c]) {
      s += '<rect x="' + (x + W / 2 - 5) + '" y="' + (y + H) + '" width="10" height="' + G +
           '" fill="var(--tenue)" opacity=".45"/>';
    }
  });

  chiavi.forEach(function (k) {
    var p = k.split(","), r = +p[0], c = +p[1];
    var x = P + (c - minC) * (W + G), y = P + (r - minR) * (H + G);
    var tipo = st.tipo[k] || "NORMALE";
    var d = st.dist[k];
    /* lo stile inline deve vincere sulle classi CSS del foglio di stile,
       altrimenti fill e stroke della classe hanno la precedenza */
    var stile = [], dash = "";
    if (tipo === "NORMALE" && d !== undefined && st.max === null) {
      stile.push("fill:var(--acc)", "fill-opacity:" + (0.1 + 0.45 * Math.min(1, d / 4)).toFixed(2));
    }
    var ev = st.evid[k];
    if (ev === "nuova") { stile.push("stroke:var(--acc)", "stroke-width:3"); }
    else if (ev === "cand") { stile.push("stroke:var(--rosso)", "stroke-width:3"); dash = ' stroke-dasharray="5 3"'; }
    else if (ev === "scarto") { stile.push("stroke:var(--rosso)", "stroke-width:2"); dash = ' stroke-dasharray="3 3"'; }
    else stile.push("stroke-width:1.5");

    s += '<rect class="' + CLASSE[tipo] + '" x="' + x + '" y="' + y + '" width="' + W +
         '" height="' + H + '" rx="9" style="' + stile.join(";") + '"' + dash + "/>";
    if (d !== undefined) {
      s += '<text x="' + (x + 7) + '" y="' + (y + 17) + '" class="sv-p" font-size="10">d' + d + "</text>";
    }
    s += '<text x="' + (x + W - 7) + '" y="' + (y + 17) + '" class="sv-p" font-size="9" text-anchor="end">' +
         k + "</text>";
    if (ETICHETTA[tipo]) {
      s += '<text x="' + (x + W / 2) + '" y="' + (y + 40) + '" class="sv-tm" text-anchor="middle" font-weight="700">' +
           ETICHETTA[tipo] + "</text>";
    }
    if (st.tpl[k]) {
      s += '<text x="' + (x + W / 2) + '" y="' + (y + (ETICHETTA[tipo] ? 56 : 44)) +
           '" class="sv-p" text-anchor="middle" font-size="9.5">' + st.tpl[k] + "</text>";
    }
  });
  return s + "</svg>";
}

var tela = $("#sim-tela"), stato = $("#sim-stato"), campoSeme = $("#sim-seme");
var bAvanti = $("#sim-avanti");
var traccia = [], passo = 0;

function mostra(k) {
  var st = statoAl(traccia, k);
  tela.innerHTML = disegna(st);
  stato.innerHTML = '<span class="fase">' + st.fase + "</span>" + st.msg;
  $("#sim-n-stanze").textContent = Object.keys(st.celle).length;
  $("#sim-n-tent").textContent = st.tent || "—";
  $("#sim-n-dist").textContent = st.max === null ? "—" : st.max;
  bAvanti.disabled = k >= traccia.length - 1;
}
function leggiSeme() {
  var v = (campoSeme.value || "").trim();
  if (!/^-?\d+$/.test(v)) { v = "42"; campoSeme.value = v; }
  return v;
}
function rigenera(passoPasso) {
  traccia = generaPiano(leggiSeme());
  passo = passoPasso ? 0 : traccia.length - 1;
  mostra(passo);
}
$("#sim-genera").addEventListener("click", function () { rigenera(false); });
$("#sim-passo").addEventListener("click", function () { rigenera(true); });
$("#sim-avanti").addEventListener("click", function () {
  if (passo < traccia.length - 1) mostra(++passo);
});
$("#sim-caso").addEventListener("click", function () {
  campoSeme.value = String(Math.floor(Math.random() * 1000000));
  rigenera(false);
});
campoSeme.addEventListener("keydown", function (e) {
  if (e.key === "Enter") { e.preventDefault(); rigenera(false); }
});
rigenera(false);
})();
