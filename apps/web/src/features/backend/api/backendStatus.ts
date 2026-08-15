// Estat compartit de "el servidor s'està despertant".
//
// El backend viu al pla gratuït de Render, que adorm el servei després de 15 minuts
// sense trànsit: la primera petició que hi arriba desperta el contenidor i pot trigar
// prop d'un minut a respondre. Sense cap senyal, l'usuari només veu un botó bloquejat
// i conclou que l'aplicació està trencada.
//
// Aquí no es consulta res al servidor: es dedueix de la durada de les peticions que ja
// s'estan fent. Si alguna passa del llindar sense resposta, l'única explicació plausible
// és el desvetllament, i s'avisa. És un mòdul deliberadament fora de Redux perquè
// l'apiClient (que no és un component) l'ha de poder alimentar.

// Per sota d'aquest temps una petició és simplement lenta i avisar-ne seria soroll.
const SLOW_REQUEST_THRESHOLD_MS = 3000;

type Listener = () => void;

const listeners = new Set<Listener>();

// Peticions d'usuari en vol. Les de fons (vegeu isBackgroundRequest a apiClient) no hi compten.
let pendingRequests = 0;
let isWakingUp = false;
let thresholdTimer: ReturnType<typeof setTimeout> | null = null;

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

const setWakingUp = (value: boolean): void => {
  if (isWakingUp === value) return;
  isWakingUp = value;
  notifyListeners();
};

const clearThresholdTimer = (): void => {
  if (thresholdTimer === null) return;
  clearTimeout(thresholdTimer);
  thresholdTimer = null;
};

// L'apiClient ho crida en sortir una petició d'usuari
export const notifyRequestStart = (): void => {
  pendingRequests += 1;

  // Un sol temporitzador per ràfega: si ja n'hi ha un en marxa, el que vindria ara
  // seria més tardà i no aportaria res.
  if (thresholdTimer !== null) return;

  thresholdTimer = setTimeout(() => {
    thresholdTimer = null;
    if (pendingRequests > 0) setWakingUp(true);
  }, SLOW_REQUEST_THRESHOLD_MS);
};

// L'apiClient ho crida en acabar la petició, tant si va bé com si falla
export const notifyRequestEnd = (): void => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests > 0) return;

  clearThresholdTimer();
  setWakingUp(false);
};

export const subscribeToBackendStatus = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getIsBackendWakingUp = (): boolean => isWakingUp;
