/*qui sta tutto quello che le pagine si scambiano: com'e' fatto un
  personaggio e come si salva. Prima queste righe erano copiate in tutti
  e quattro gli script, e infatti si erano gia' sfasate*/

class Pg {
  constructor(nik, ses, gun, armor, health) {
    this.nik = nik;
    this.ses = ses;
    this.gun = gun;
    this.armor = armor;
    this.health = health;
  }
}

/*ripesca i due personaggi lasciati dalla pagina precedente*/

function carica() {
  return {
    buono: JSON.parse(localStorage.getItem("buonos")),
    cattivo: JSON.parse(localStorage.getItem("cattivos")),
  };
}

/*li passa alla pagina dopo*/

function salva(buono, cattivo) {
  localStorage.setItem("buonos", JSON.stringify(buono));
  localStorage.setItem("cattivos", JSON.stringify(cattivo));
}
