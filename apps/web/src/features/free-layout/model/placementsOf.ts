// On surt cada seqüència. És el que diu la llista «+ Afegeix una seqüència»
// («a les pàgines 1 i 3», «a totes les pàgines») i el que omple el calaix
// «Sense col·locar». Només hi compten els blocs de seqüència.
import type { DocumentPages, PagePlacement } from "@/types/document";

export interface SequenceWhereabouts {
  /** Té algun bloc comú: surt a totes les pàgines */
  common: boolean;
  /** Les pàgines on té algun bloc propi, per ordre i sense repetir */
  sheets: number[];
}

const showsSequence =
  (sequenceKey: number) =>
  (placement: PagePlacement): boolean =>
    placement.kind === "sequence" && placement.sequenceKey === sequenceKey;

/** On surt la seqüència. */
export const whereIs = (
  pages: DocumentPages,
  sequenceKey: number,
): SequenceWhereabouts => ({
  common: pages.common.some(showsSequence(sequenceKey)),
  sheets: pages.sheets.flatMap((sheet, index) =>
    sheet.placements.some(showsSequence(sequenceKey)) ? [index] : [],
  ),
});

/** Si la seqüència surt en alguna pàgina. */
export const isPlaced = (
  pages: DocumentPages,
  sequenceKey: number,
): boolean => {
  const { common, sheets } = whereIs(pages, sequenceKey);
  return common || sheets.length > 0;
};

/**
 * Les seqüències del document que no surten enlloc: el calaix «Sense
 * col·locar». Conserva l'ordre de `sequenceKeys`.
 */
export const unplacedSequenceKeys = (
  pages: DocumentPages,
  sequenceKeys: readonly number[],
): number[] => sequenceKeys.filter((key) => !isPlaced(pages, key));
