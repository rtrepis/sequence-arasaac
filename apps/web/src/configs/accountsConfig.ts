// Interruptor de compilació de les funcions de compte
//
// L'app funciona sencera sense compte —la configuració i les seqüències viuen al
// navegador— i el compte només hi afegeix sincronització entre dispositius,
// vocabulari personal i documents al núvol. Aquest interruptor permet publicar
// una compilació sense res d'això, sense treure'n el codi: es torna a encendre
// canviant el valor i tornant a desplegar.
//
// És de compilació i no de base de dades a propòsit. L'altre interruptor de
// l'app (`registrationOpen`, a `modules/config`) sí que viu a la BD perquè
// tancar el registre ha de ser un clic; aquest, en canvi, s'engega justament
// quan no es vol dependre que el servidor respongui —una aturada del servei de
// comptes, un problema de quota— i llegir-lo del servidor voldria dir esperar
// el desvetllament de Render per saber si es pot pintar el botó d'entrar.
//
// El valor per defecte és «encendre»: una compilació sense la variable es
// comporta com sempre.
export const ACCOUNTS_ENABLED: boolean =
  import.meta.env.VITE_ACCOUNTS_ENABLED !== "false";
