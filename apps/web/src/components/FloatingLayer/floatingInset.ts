// Espai que les capes flotants del cantó inferior reserven al final del
// contingut.
//
// Un avís que no marxa sol («Connectant amb el teu compte…», «La sessió ha
// caducat») és `position: fixed` a baix de tot: es queda damunt de l'última
// fila de pictogrames i, com que la pàgina ja s'ha acabat, no hi ha manera
// d'apartar-lo amb l'scroll. Passa igual en mòbil que en escriptori.
//
// La solució no és moure l'avís —a baix és on ha de ser— sinó que el contingut
// reservi al seu final l'alçada del que hi ha a sobre. Cada capa declara aquí
// quant ocupa i el contingut fa servir la més alta.
//
// Viu fora de Redux, com `backendStatus` i `documentTransfer`: qui l'alimenta
// és un `ResizeObserver`, no una acció de l'usuari, i el valor no és estat de
// l'app sinó una mida del navegador.

/** Nom de la variable CSS que llegeix el contenidor del contingut. */
export const FLOATING_INSET_VARIABLE = "--app-floating-inset";

const heights = new Map<string, number>();

const publish = (): void => {
  const tallest =
    heights.size === 0 ? 0 : Math.max(...Array.from(heights.values()));

  document.documentElement.style.setProperty(
    FLOATING_INSET_VARIABLE,
    `${Math.round(tallest)}px`,
  );
};

/**
 * Declara (o retira, amb `null`) l'alçada que una capa flotant ocupa al peu de
 * la finestra. L'identificador ha de ser estable: així la mateixa capa
 * s'actualitza en comptes d'acumular-se.
 */
export const setFloatingInset = (id: string, height: number | null): void => {
  if (height === null) {
    if (!heights.delete(id)) return;
  } else {
    heights.set(id, height);
  }

  publish();
};
