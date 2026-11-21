// Senyal genèric: hi ha una capa de baix que ocupa mitja pantalla o més.
//
// Quan el panell de baix (`AppBottomSheet`) puja a mig o a sencer, la barra de
// dalt de l'app s'ha d'amagar perquè el que queda a sobre del panell guanyi
// aquells píxels (M5 de `docs/plans/fets/PLA-vista-mobil.md`). El panell no sap res de la
// barra, i la barra no sap res del panell: el panell ho declara aquí i qui vulgui
// fer-ne cas s'hi subscriu amb `useFloatingRaised`.
//
// Fora de Redux pel mateix motiu que la resta de `FloatingLayer`: és estat de
// la pantalla, no de l'app, i no s'ha de desar enlloc.

const raised = new Set<string>();
const listeners = new Set<() => void>();

/**
 * Declara si la capa `id` ocupa mitja pantalla o més. L'identificador ha de
 * ser estable; en desmuntar-se, la capa ho ha de retirar amb `false`.
 */
export const setFloatingRaised = (id: string, isRaised: boolean): void => {
  const changed = isRaised ? !raised.has(id) : raised.has(id);
  if (!changed) return;

  if (isRaised) raised.add(id);
  else raised.delete(id);

  listeners.forEach((listener) => listener());
};

/** Si alguna capa declarada ocupa mitja pantalla o més. */
export const isFloatingRaised = (): boolean => raised.size > 0;

/** Subscripció per a `useSyncExternalStore`. */
export const subscribeFloatingRaised = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
