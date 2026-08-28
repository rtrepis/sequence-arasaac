// Estat compartit de «la sessió s'ha acabat».
//
// El token d'accés dura 15 minuts i no es renova sol: es renova quan una petició
// rep un 401. Quan aquell refresc falla —cookie caducada als 7 dies, sessió
// tancada des d'un altre dispositiu, compte suspès— l'única cosa que passava era
// que el token de memòria es posava a null. Redux continuava amb el correu i el
// token, la barra continuava dient qui eres i el botó flotant continuava oferint
// el núvol, de manera que l'usuari reintentava una acció que no podia funcionar.
//
// Va fora de Redux, com `backendStatus`, perquè qui se n'assabenta és
// l'`apiClient`, que no és un component i no pot despatxar: importar-hi l'store
// seria un cicle (store → slices → serveis → apiClient) i, de passada, posaria
// coneixement de Redux dins del client HTTP.
type Listener = () => void;

const listeners = new Set<Listener>();

// Codi semàntic de la fallada del refresc, o null si la sessió no ha caigut.
// El codi mana perquè no tots volen dir el mateix: a un compte suspès no se li
// pot dir «torna a entrar».
let expiredCode: string | null = null;

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

/** L'apiClient ho crida quan el refresc del token ha fallat de debò. */
export const notifySessionExpired = (code: string): void => {
  // El primer codi és el que explica per què ha caigut la sessió; els que
  // vinguin després són peticions en cua fallant per la mateixa raó
  if (expiredCode !== null) return;

  expiredCode = code;
  notifyListeners();
};

/** Hi torna a haver sessió (o l'usuari ha tancat l'avís). */
export const clearExpiredSession = (): void => {
  if (expiredCode === null) return;

  expiredCode = null;
  notifyListeners();
};

export const subscribeToSessionExpiry = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getExpiredSessionCode = (): string | null => expiredCode;
