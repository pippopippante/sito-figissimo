/* Tutta la parte di lettura della guida: tema, indice, scrollspy,
   menu mobile, evidenziazione del codice e ricerca. */

(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function (s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};
var norm = function (s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/* ══ Tema ═══════════════════════════════════════════════════════════ */
var btnTema = $("#tema");
function applicaTema(t) {
  if (t) document.documentElement.setAttribute("data-tema", t);
  else document.documentElement.removeAttribute("data-tema");
  var scuro = t === "scuro" ||
    (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
  btnTema.textContent = scuro ? "☀" : "🌙";
  btnTema.setAttribute("aria-label", scuro ? "Passa al tema chiaro" : "Passa al tema scuro");
}
var temaSalvato = null;
try { temaSalvato = localStorage.getItem("jzelda-tema"); } catch (e) {}
applicaTema(temaSalvato);
btnTema.addEventListener("click", function () {
  var attuale = document.documentElement.getAttribute("data-tema");
  var scuroOra = attuale === "scuro" ||
    (!attuale && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var nuovo = scuroOra ? "chiaro" : "scuro";
  applicaTema(nuovo);
  try { localStorage.setItem("jzelda-tema", nuovo); } catch (e) {}
});

/* ══ Indice ═════════════════════════════════════════════════════════ */
var sezioni = $$("main section[id]");
var gruppi = { s1: "Fondamenta", s4: "Il motore", s7: "Il gioco", s12: "Per l'esame" };
var nav = $("#indice");
var html = '<ol><li><a href="#cima">Copertina</a></li>';
sezioni.forEach(function (sec, i) {
  if (gruppi[sec.id]) html += '<li class="gruppo">' + gruppi[sec.id] + "</li>";
  var titolo = $("h2", sec).textContent;
  html += '<li><a href="#' + sec.id + '"><span class="num">' + (i + 1) + "</span>" +
          esc(titolo) + "</a></li>";
});
nav.innerHTML = html + "</ol>";
var voci = $$("a[href^='#s']", nav);

/* ══ Scrollspy + avanzamento ════════════════════════════════════════ */
var barra = $("#avanzamento"), btnSu = $("#su"), inAttesa = false;
function aggiornaScroll() {
  inAttesa = false;
  var y = window.scrollY || document.documentElement.scrollTop;
  var h = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + "%";
  btnSu.classList.toggle("visto", y > 600);

  var attiva = null;
  for (var i = 0; i < sezioni.length; i++) {
    if (sezioni[i].getBoundingClientRect().top <= 140) attiva = sezioni[i].id;
  }
  voci.forEach(function (a) {
    var on = a.getAttribute("href") === "#" + attiva;
    a.classList.toggle("attivo", on);
    if (on && nav.scrollHeight > nav.clientHeight) {
      var t = a.offsetTop, n = nav.scrollTop;
      if (t < n + 40 || t > n + nav.clientHeight - 60) nav.scrollTop = t - nav.clientHeight / 2;
    }
  });
}
window.addEventListener("scroll", function () {
  if (!inAttesa) { inAttesa = true; requestAnimationFrame(aggiornaScroll); }
}, { passive: true });
window.addEventListener("resize", aggiornaScroll, { passive: true });
btnSu.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

/* ══ Menu mobile ════════════════════════════════════════════════════ */
var velo = $("#velo"), apri = $("#apri-menu");
function menu(stato) {
  nav.classList.toggle("aperta", stato);
  velo.classList.toggle("visto", stato);
  apri.setAttribute("aria-expanded", String(stato));
}
apri.addEventListener("click", function () { menu(!nav.classList.contains("aperta")); });
velo.addEventListener("click", function () { menu(false); });
nav.addEventListener("click", function (e) { if (e.target.tagName === "A") menu(false); });

/* ══ Evidenziazione Java ════════════════════════════════════════════ */
var PAROLE = /^(abstract|boolean|break|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|package|private|protected|public|return|static|super|switch|synchronized|this|throw|throws|try|void|while|true|false|null|var)$/;
var TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(\d[\d_]*[LlFfDd]?)\b|([A-Za-z_$][\w$]*)/g;
$$("code.lang-java").forEach(function (blocco) {
  var src = blocco.textContent, out = "", ultimo = 0, m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src)) !== null) {
    out += esc(src.slice(ultimo, m.index));
    ultimo = m.index + m[0].length;
    if (m[1]) out += '<span class="c">' + esc(m[1]) + "</span>";
    else if (m[2]) out += '<span class="s">' + esc(m[2]) + "</span>";
    else if (m[3]) out += '<span class="n">' + esc(m[3]) + "</span>";
    else if (PAROLE.test(m[4])) out += '<span class="k">' + m[4] + "</span>";
    else if (/^[A-Z]/.test(m[4])) out += '<span class="t">' + m[4] + "</span>";
    else out += esc(m[4]);
  }
  blocco.innerHTML = out + esc(src.slice(ultimo));
});

/* ══ Copia il codice ════════════════════════════════════════════════ */
$$(".codice").forEach(function (box) {
  var b = document.createElement("button");
  b.className = "btn copia"; b.type = "button"; b.textContent = "copia";
  b.addEventListener("click", function () {
    var testo = $("code", box) ? $("code", box).textContent : $("pre", box).textContent;
    var fine = function () { b.textContent = "copiato ✓"; setTimeout(function () { b.textContent = "copia"; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(testo).then(fine, function () {});
    else {
      var t = document.createElement("textarea");
      t.value = testo; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); fine(); } catch (e) {}
      document.body.removeChild(t);
    }
  });
  box.appendChild(b);
});

/* ══ Flusso del tick ════════════════════════════════════════════════ */
$$("#flusso-tick li").forEach(function (li) {
  $("button", li).addEventListener("click", function () { li.classList.toggle("aperto"); });
});

/* ══ Diagrammi cliccabili ═══════════════════════════════════════════ */
function vaiA(sel) {
  var bersaglio = document.querySelector(sel);
  if (!bersaglio) return;
  bersaglio.scrollIntoView({ behavior: "smooth", block: "start" });
  bersaglio.classList.remove("evidenzia-flash");
  void bersaglio.offsetWidth;
  bersaglio.classList.add("evidenzia-flash");
  history.replaceState(null, "", sel);
}
$$(".diag [data-vai]").forEach(function (g) {
  g.setAttribute("tabindex", "0");
  g.setAttribute("role", "link");
  var salta = function () { vaiA(g.getAttribute("data-vai")); };
  g.addEventListener("click", salta);
  g.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); salta(); }
  });
});

/* ══ Ricerca ════════════════════════════════════════════════════════ */
var indice = [];
sezioni.forEach(function (sec) {
  var titolo = $("h2", sec).textContent;
  $$("p, li, td, h3, h4, summary, .dett", sec).forEach(function (el) {
    if (el.closest(".sim") || el.classList.contains("sommario")) return;
    var t = el.textContent.replace(/\s+/g, " ").trim();
    if (t.length < 12) return;
    indice.push({ sec: sec.id, titolo: titolo, el: el, testo: t, n: norm(t) });
  });
});

var campo = $("#cerca"), pannello = $("#esiti"), scelto = -1, attesa;
function chiudiEsiti() { pannello.classList.remove("aperto"); pannello.innerHTML = ""; scelto = -1; }
function cerca(q) {
  var qn = norm(q.trim());
  if (qn.length < 2) return chiudiEsiti();
  var trovati = [];
  for (var i = 0; i < indice.length && trovati.length < 14; i++) {
    var p = indice[i].n.indexOf(qn);
    if (p !== -1) trovati.push({ v: indice[i], p: p });
  }
  if (!trovati.length) {
    pannello.innerHTML = '<div class="vuoto">Nessun risultato per “' + esc(q) + "”.</div>";
    pannello.classList.add("aperto");
    return;
  }
  pannello.innerHTML = trovati.map(function (t, i) {
    var da = Math.max(0, t.p - 55), a = Math.min(t.v.testo.length, t.p + qn.length + 75);
    var pre = (da > 0 ? "…" : "") + t.v.testo.slice(da, t.p);
    var mid = t.v.testo.slice(t.p, t.p + qn.length);
    var post = t.v.testo.slice(t.p + qn.length, a) + (a < t.v.testo.length ? "…" : "");
    return '<button type="button" data-i="' + i + '"><span class="dove">' +
      esc(t.v.titolo) + '</span><span class="frase">' + esc(pre) + "<mark>" +
      esc(mid) + "</mark>" + esc(post) + "</span></button>";
  }).join("");
  pannello.classList.add("aperto");
  scelto = -1;
  $$("button", pannello).forEach(function (b, i) {
    b.addEventListener("click", function () { apriEsito(trovati[i].v); });
  });
}
function apriEsito(v) {
  chiudiEsiti();
  campo.blur();
  menu(false);
  var det = v.el.closest("details");
  if (det) det.open = true;
  var li = v.el.closest("#flusso-tick li");
  if (li) li.classList.add("aperto");
  var bersaglio = v.el.tagName === "SUMMARY" ? v.el.parentElement : v.el;
  bersaglio.scrollIntoView({ behavior: "smooth", block: "center" });
  bersaglio.classList.remove("evidenzia-flash");
  void bersaglio.offsetWidth;
  bersaglio.classList.add("evidenzia-flash");
}
campo.addEventListener("input", function () {
  clearTimeout(attesa);
  var v = campo.value;
  attesa = setTimeout(function () { cerca(v); }, 110);
});
campo.addEventListener("keydown", function (e) {
  var bottoni = $$("button", pannello);
  if (e.key === "Escape") { chiudiEsiti(); campo.blur(); return; }
  if (!bottoni.length) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    scelto = (scelto + (e.key === "ArrowDown" ? 1 : bottoni.length - 1)) % bottoni.length;
    bottoni.forEach(function (b, i) { b.classList.toggle("sel", i === scelto); });
    bottoni[scelto].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    bottoni[scelto < 0 ? 0 : scelto].click();
  }
});
document.addEventListener("click", function (e) {
  if (!e.target.closest(".ricerca")) chiudiEsiti();
});
document.addEventListener("keydown", function (e) {
  var dentro = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
  if (e.key === "/" && !dentro) { e.preventDefault(); campo.focus(); campo.select(); }
});

aggiornaScroll();
})();
