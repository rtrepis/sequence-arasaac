// Les tres alçades del panell de baix i com se n'escull una en deixar anar el
// dit. Lògica pura, sense React ni DOM: el component hi passa les mides i en
// rep la parada.

/** Les tres parades del panell (M2 de `docs/plans/fets/PLA-vista-mobil.md`). */
export type BottomSheetSnap = "collapsed" | "half" | "full";

/** Ordre de baix a dalt: el que fa servir el gest ràpid per buscar la següent. */
export const BOTTOM_SHEET_SNAPS: readonly BottomSheetSnap[] = [
  "collapsed",
  "half",
  "full",
];

/**
 * Franja que el panell deixa sempre a dalt quan és a sencer. Mai el 100 %: la
 * franja és el botó que torna a mig, i el que hi ha a sota no es perd mai del
 * tot (§4 del pla, «Tres alçades»).
 */
export const BOTTOM_SHEET_TOP_GAP = 64;

/** Fracció de la pantalla que ocupa el panell a mig. */
export const BOTTOM_SHEET_HALF_RATIO = 0.5;

/**
 * Velocitat (px/ms) a partir de la qual deixar anar el dit és un gest ràpid i
 * el panell va a la parada següent en aquella direcció, encara que la més
 * propera sigui la de sortida. Sense, un cop de dit curt no mouria res.
 */
export const BOTTOM_SHEET_FLING_VELOCITY = 0.5;

export type BottomSheetHeights = Record<BottomSheetSnap, number>;

/**
 * L'alçada visible de cada parada.
 *
 * @param viewportHeight alçada de la pantalla que es veu (la del
 *   `visualViewport`: amb el teclat virtual obert, la que en queda a sobre)
 * @param headerHeight alçada de la capçalera (nansa i fila de botons): és el
 *   que es veu plegat
 */
export const bottomSheetHeights = (
  viewportHeight: number,
  headerHeight: number,
): BottomSheetHeights => {
  const full = Math.max(headerHeight, viewportHeight - BOTTOM_SHEET_TOP_GAP);
  const half = Math.min(
    full,
    Math.max(
      headerHeight,
      Math.round(viewportHeight * BOTTOM_SHEET_HALF_RATIO),
    ),
  );

  return { collapsed: headerHeight, half, full };
};

/**
 * La parada on ha d'anar el panell quan es deixa anar a l'alçada `visible`.
 *
 * @param velocity px/ms, positiva cap amunt (el panell creix)
 */
export const pickBottomSheetSnap = (
  visible: number,
  velocity: number,
  heights: BottomSheetHeights,
): BottomSheetSnap => {
  // Un gest ràpid va a la parada següent en aquella direcció. El marge de 4 px
  // evita que un panell gairebé quiet a una parada s'hi quedi per arrodoniment
  if (Math.abs(velocity) > BOTTOM_SHEET_FLING_VELOCITY) {
    if (velocity > 0)
      return (
        BOTTOM_SHEET_SNAPS.find((snap) => heights[snap] > visible + 4) ?? "full"
      );

    return (
      [...BOTTOM_SHEET_SNAPS]
        .reverse()
        .find((snap) => heights[snap] < visible - 4) ?? "collapsed"
    );
  }

  // Si no, la més propera
  return BOTTOM_SHEET_SNAPS.reduce((best, snap) =>
    Math.abs(heights[snap] - visible) < Math.abs(heights[best] - visible)
      ? snap
      : best,
  );
};
