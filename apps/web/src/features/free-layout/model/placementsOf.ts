// On surt cada seqüència en mode lliure. És el que diu la llista «+ Afegeix una
// seqüència» («a les pàgines 1 i 3», «a totes les pàgines») i el que omple el
// calaix «Sense col·locar».
import type { FreeLayout } from "@/types/document";

export interface SequenceWhereabouts {
  /** Té alguna col·locació comuna: surt a totes les pàgines */
  common: boolean;
  /** Els fulls on té alguna col·locació pròpia, per ordre i sense repetir */
  sheets: number[];
}

/** On surt la seqüència. */
export const whereIs = (
  layout: FreeLayout,
  sequenceKey: number,
): SequenceWhereabouts => ({
  common: layout.common.some((p) => p.sequenceKey === sequenceKey),
  sheets: layout.sheets.flatMap((sheet, index) =>
    sheet.placements.some((p) => p.sequenceKey === sequenceKey) ? [index] : [],
  ),
});

/** Si la seqüència surt en alguna pàgina. */
export const isPlaced = (layout: FreeLayout, sequenceKey: number): boolean => {
  const { common, sheets } = whereIs(layout, sequenceKey);
  return common || sheets.length > 0;
};

/**
 * Les seqüències del document que no surten enlloc: el calaix «Sense
 * col·locar». Conserva l'ordre de `sequenceKeys`.
 */
export const unplacedSequenceKeys = (
  layout: FreeLayout,
  sequenceKeys: readonly number[],
): number[] => sequenceKeys.filter((key) => !isPlaced(layout, key));
