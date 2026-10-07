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


/* colomba: cliccata attraversa lo schermo ondeggiando, esce a sinistra e torna planando al suo posto */

var colomba = document.getElementById("colomba");

colomba.onclick = function () {
  if (colomba.classList.contains("vola")) return;
  var largo = innerWidth + 150;
  var alto = innerHeight;
  // quanto sale la colomba (in px) a un punto t del volo, da 0 a 1
  function su(t) {
    return alto * (0.3 * Math.sin(Math.PI * t) + 0.04 * Math.sin(6 * Math.PI * t));
  }
  var andata = [];
  for (var i = 0; i <= 60; i++) {
    var t = i / 60;
    // inclinazione: becco in su quando sale, in giù quando scende
    var pendenza = ((su(t + 0.01) - su(t)) / (largo * 0.01)) * 57;
    andata.push({
      transform: "translate(" + -t * largo + "px," + -su(t) + "px) rotate(" + Math.max(-25, Math.min(25, pendenza)) + "deg)",
    });
  }
  colomba.classList.add("vola");
  colomba.animate(andata, 2600).finished
    .then(function () {
      return colomba.animate(
        [{ transform: "translate(150px," + -alto * 0.25 + "px) rotate(-10deg)" }, { transform: "none" }],
        { duration: 1400, easing: "ease-out" }
      ).finished;
    })
    .then(function () {
      colomba.classList.remove("vola");
    });
};
