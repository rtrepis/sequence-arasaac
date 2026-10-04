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
// A la 2.4.1 el valor és fix a `false` i ja no es llegeix de la variable
// d'entorn `VITE_ACCOUNTS_ENABLED`: la compilació publicada va sense comptes
// passi el que passi a la configuració del desplegament. Per tornar-los a
// encendre cal posar-hi `true` (o recuperar la lectura de l'entorn) i tornar a
// desplegar.
export const ACCOUNTS_ENABLED: boolean = false;
