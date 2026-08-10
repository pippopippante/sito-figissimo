/*pagina di vittoria e di sconfitta, sono la stessa scritta a seconda
  di come e' finita*/

const { buono, cattivo } = carica();

const vita = document.getElementById("vita");

if (buono.health > 0) {
  vita.innerHTML = `complimenti hai vinto e avevi ancora ${buono.health}hp`;
} else {
  vita.innerHTML = `ce ${buono.nik}, te ha aperto e ${cattivo.nik} ha ancora ${cattivo.health}hp`;
}
