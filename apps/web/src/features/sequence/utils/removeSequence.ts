// Treure una seqüència qualsevol del document, no només l'última (pla dels
// estils, D21: «Treu aquesta seqüència» treu l'oberta).
//
// Les seqüències es diuen per una clau numèrica que és també la posició de la
// pestanya (0, 1, 2…), i la interfície compta que no hi ha forats. Per això,
// en treure'n una, totes les de després baixen una clau, i amb elles tot el
// que hi apunta: la vista, el nom, l'estil, l'identificador del fitxer, els
// camps desconeguts, l'ordre i els blocs de les pàgines.
import type {
  DocumentPages,
  DocumentSAAC,
  PagePlacement,
} from "@/types/document";
import { removeSequencePlacements } from "@features/free-layout/model/sheets";

/** Una taula per clau de seqüència, sense la clau treta i amb les de després una avall. */
const shiftKeys = <T>(
  table: { [key: number]: T } | undefined,
  removed: number,
): { [key: number]: T } | undefined => {
  if (table === undefined) return undefined;
  const next: { [key: number]: T } = {};
  Object.entries(table).forEach(([rawKey, value]) => {
    const key = Number(rawKey);
    if (key === removed) return;
    next[key > removed ? key - 1 : key] = value;
  });
  return next;
};

const shiftPlacement = (
  placement: PagePlacement,
  removed: number,
): PagePlacement =>
  placement.kind === "sequence" && placement.sequenceKey > removed
    ? { ...placement, sequenceKey: placement.sequenceKey - 1 }
    : placement;

const shiftPages = (pages: DocumentPages, removed: number): DocumentPages => {
  const kept = removeSequencePlacements(pages, removed);
  return {
    ...kept,
    sheets: kept.sheets.map((sheet) => ({
      ...sheet,
      placements: sheet.placements.map((placement) =>
        shiftPlacement(placement, removed),
      ),
    })),
    common: kept.common.map((placement) => shiftPlacement(placement, removed)),
  };
};

/**
 * El document sense la seqüència `key`. Si era l'única, no canvia: un document
 * té sempre una seqüència com a mínim. La seqüència oberta passa a ser la que
 * ocupa el lloc de la treta (la de després), o l'anterior si era l'última.
 */
export const removeSequenceFromDocument = (
  document: DocumentSAAC,
  key: number,
): DocumentSAAC => {
  const count = Object.keys(document.content).length;
  if (count <= 1 || document.content[key] === undefined) return document;

  const next: DocumentSAAC = {
    ...document,
    content: shiftKeys(document.content, key) ?? {},
    viewSettings: shiftKeys(document.viewSettings, key) ?? {},
    activeSAAC:
      document.activeSAAC > key
        ? document.activeSAAC - 1
        : Math.min(document.activeSAAC, count - 2),
  };
  const sequenceNames = shiftKeys(document.sequenceNames, key);
  if (sequenceNames) next.sequenceNames = sequenceNames;
  const sequenceStyleIds = shiftKeys(document.sequenceStyleIds, key);
  if (sequenceStyleIds) next.sequenceStyleIds = sequenceStyleIds;
  const sequenceIds = shiftKeys(document.sequenceIds, key);
  if (sequenceIds) next.sequenceIds = sequenceIds;
  if (document.saacExtra?.sequences)
    next.saacExtra = {
      ...document.saacExtra,
      sequences: shiftKeys(document.saacExtra.sequences, key),
    };
  if (document.order)
    next.order = document.order
      .filter((sequenceKey) => sequenceKey !== key)
      .map((sequenceKey) =>
        sequenceKey > key ? sequenceKey - 1 : sequenceKey,
      );
  if (document.pages) next.pages = shiftPages(document.pages, key);
  return next;
};
