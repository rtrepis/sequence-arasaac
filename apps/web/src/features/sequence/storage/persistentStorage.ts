// Demana al navegador que no desallotgi l'esborrany.
//
// Sense demanar-ho, l'esborrany viu en emmagatzematge que el navegador pot
// buidar quan li falta espai — i el nivell 1 de durabilitat deixa d'aguantar el
// que diu que aguanta.
//
// Els tres navegadors no s'hi comporten igual, i això decideix des d'on es
// crida:
// - Chrome i derivats ho resolen amb una heurística **en silenci**, sense
//   diàleg, i es pot tornar a demanar més endavant.
// - Firefox obre un diàleg de permís i, sobretot, **no concedeix res si la
//   crida no ve d'un gest de l'usuari**: per això no n'hi ha prou amb demanar-ho
//   des del desat automàtic, que passa un segon després d'un canvi.
// - Safari té política pròpia i el seu límit de 7 dies sense visites continua
//   manant. Contra això no hi ha crida que valgui: la resposta de l'app són el
//   fitxer `.saac` i el núvol.

// Una sola petició per càrrega de pàgina: un «no» de l'heurística de Chrome no
// s'ha de convertir en un degoteig de peticions a cada desat.
let hasAsked = false;

/**
 * Demana emmagatzematge persistent, si el navegador el té i encara no està
 * concedit. El resultat s'ignora a propòsit: si es denega, tot queda com abans
 * i no hi ha res a dir-li a l'usuari.
 */
export const requestPersistentStorage = async (): Promise<void> => {
  if (hasAsked) return;
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return;

  hasAsked = true;

  try {
    // Si ja està concedit, no cal tornar a demanar-ho — ni que Firefox obri cap
    // diàleg per a una cosa que ja té resposta
    if (await navigator.storage.persisted()) return;

    await navigator.storage.persist();
  } catch {
    // Que no es pugui demanar (mode privat, política del navegador) no és un
    // problema de l'usuari i no canvia res del que pot fer
  }
};
