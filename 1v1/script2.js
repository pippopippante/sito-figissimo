/*JSON.parse ridava gia' i personaggi pronti, non serve ricostruirli*/

const buonost = JSON.parse(localStorage.getItem("buonos"));

const cattivost = JSON.parse(localStorage.getItem("cattivos"));

var vita = document.getElementById("vita");

if (buonost.health > 0) {
  vita.innerHTML = `complimenti hai vinto e avevi ancora ${buonost.health}hp`;
} else {
  vita.innerHTML = `ce ${buonost.nik}, te ha aperto e ${cattivost.nik} ha ancora ${cattivost.health}hp`;
}
