const buono = JSON.parse(localStorage.getItem("buonos"));

const cattivo = JSON.parse(localStorage.getItem("cattivos"));

var rut = document.getElementById("dud");
rut.innerHTML = `${buono.nik}
    ${buono.health}/200hp godzilla 200000/200000hp`;

/*salva e manda alla sconfitta se sei morto: si controlla all'apertura
  invece di girare a vuoto due volte al secondo*/

function stiddu() {
  localStorage.setItem("buonos", JSON.stringify(buono));
  if (buono.health <= 0) {
    location.href = "looser.html";
  }
}

stiddu();
