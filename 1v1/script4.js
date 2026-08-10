const { buono } = carica();

/*il nemico del livello 2. Lo salviamo al posto del vecchio cattivo, cosi'
  la pagina della sconfitta sa chi e' stato ad aprirti*/

const godzilla = new Pg("godzilla", "lucertola", 200000, 9999, 200000);

const rut = document.getElementById("dud");

rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp godzilla ${godzilla.health}/200000hp`;

/*i bottoni dicono "muori" e infatti muori: contro godzilla non c'e'
  niente da fare, qualunque cosa premi ti apre in due*/

function risposta() {
  buono.health = buono.health - godzilla.gun + buono.armor;
  salva(buono, godzilla);
  location.href = "looser.html";
}
