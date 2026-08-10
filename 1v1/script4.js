const buono = JSON.parse(localStorage.getItem("buonos"));

const cattivo = JSON.parse(localStorage.getItem("cattivos"));

/*funzioni per i bottoni azzione*/
var rut = document.getElementById("dud");
rut.innerHTML = `${buono.nik} 
    ${buono.health}/200hp godzilla 200000/200000hp`;


function stiddu() {
  localStorage.setItem("buonos", JSON.stringify(buono));
  if (buono.health <= 0) {
    location.href = "looser.html";
  }
}

setInterval(stiddu, 500);