// Estat compartit del progrés de transferència d'un document.
//
// Desar una seqüència amb imatges pròpies pot voler dir enviar uns quants megabytes,
// i carregar-la, rebre'ls. Amb un indicador indeterminat l'usuari no sap si allò
// avança o s'ha penjat, i acaba prement el botó una segona vegada. Els events de
// progrés d'axios sí que ho saben, i aquí es guarden perquè els pugui llegir qui
// mostra el diàleg.
//
// És un mòdul fora de Redux, com backendStatus: qui l'alimenta és la capa de servei
// (que no és un component) i el thunk no pot rebre una funció per argument sense
// convertir l'acció en no serialitzable.

// upload = enviant el document al núvol; download = rebent-lo
export type DocumentTransferPhase = "upload" | "download";

export interface DocumentTransferState {
  phase: DocumentTransferPhase | null;
  /** Percentatge 0–100, o null quan el servidor no diu la mida total. */
  percent: number | null;
}

type Listener = () => void;

const listeners = new Set<Listener>();

const IDLE: DocumentTransferState = { phase: null, percent: null };

let state: DocumentTransferState = IDLE;

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

// El progrés arriba en ràfegues i sovint repeteix el mateix percentatge sencer:
// només es notifica quan el valor visible canvia, perquè no es repinti per res.
const setState = (next: DocumentTransferState): void => {
  if (state.phase === next.phase && state.percent === next.percent) return;
  state = next;
  notifyListeners();
};

/**
 * Registra el progrés d'una transferència.
 *
 * `total` pot no arribar (resposta comprimida sense Content-Length): en aquest cas
 * el percentatge queda a null i qui ho mostri ha de caure a un indicador
 * indeterminat, que és honest, en comptes d'inventar-se un número.
 */
export const notifyTransferProgress = (
  phase: DocumentTransferPhase,
  loaded: number,
  total?: number,
): void => {
  const percent =
    total && total > 0
      ? Math.min(100, Math.round((loaded * 100) / total))
      : null;

  setState({ phase, percent });
};

export const resetTransferProgress = (): void => setState(IDLE);

export const subscribeToTransferProgress = (
  listener: Listener,
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getTransferState = (): DocumentTransferState => state;
