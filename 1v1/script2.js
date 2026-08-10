class Pgs {
  constructor(nik, ses, gun, armor, health) {
    this.nik = nik;
    this.ses = ses;
    this.gun = gun;
    this.armor = armor;
    this.health = health;
  }
}

const buonoData = JSON.parse(localStorage.getItem("buonos"));

const cattivoData = JSON.parse(localStorage.getItem("cattivos"));

const buonost = new Pgs(
  buonoData.nik,
  buonoData.ses,
  buonoData.gun,
  buonoData.armor,
  buonoData.health,
);


const cattivost = new Pgs(
  cattivoData.nik,
  cattivoData.ses,
  cattivoData.gun,
  cattivoData.armor,
  cattivoData.health,
);

var vita =document.getElementById("vita");
if(buonost.health>=0){
  vita.innerHTML=`complimenti hai vinto e avevi ancora ${buonost.health}hp`;
}else{
  vita.innerHTML=`ce ${buonost.nik}, te ha aperto e ${cattivost.nik} ha ancora ${buonost.health}hp`;
}
