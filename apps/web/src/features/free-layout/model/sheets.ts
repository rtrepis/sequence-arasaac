// Operacions sobre les pàgines del document i els seus blocs. Totes són pures
// (retornen unes pàgines noves i no toquen les que reben), i els identificadors
// nous els dona qui crida, perquè les proves puguin fixar-los.
// Vegeu `docs/decisions/ADR-005-disposicio-lliure.md`.
import type {
  DocumentPages,
  DocumentSheet,
  PagePlacement,
  SheetMode,
} from "@/types/document";
import { isBoxed } from "./placement";

/** Genera un identificador nou: `"sh"` per a una pàgina, `"pl"` per a un bloc. */
export type NewLayoutId = (prefix: "sh" | "pl") => string;

/** On és un bloc: en una pàgina (el seu índex) o als comuns. */
export type PlacementLocation = number | "common";

/** Una pàgina buida. */
export const emptySheet = (
  newId: NewLayoutId,
  mode: SheetMode,
): DocumentSheet => ({ id: newId("sh"), mode, placements: [] });

/** Posa una pàgina just després de `afterIndex`. */
export const insertSheet = (
  pages: DocumentPages,
  afterIndex: number,
  sheet: DocumentSheet,
): DocumentPages => {
  const sheets = [...pages.sheets];
  sheets.splice(afterIndex + 1, 0, sheet);
  return { ...pages, sheets };
};

/** Unes pàgines amb una sola pàgina buida. */
export const emptyPages = (
  newId: NewLayoutId,
  mode: SheetMode,
): DocumentPages => ({
  sheets: [emptySheet(newId, mode)],
  common: [],
});

/** El bloc amb aquest `id`, i on és. */
export const findPlacement = (
  pages: DocumentPages,
  placementId: string,
): { placement: PagePlacement; location: PlacementLocation } | undefined => {
  const common = pages.common.find(({ id }) => id === placementId);
  if (common) return { placement: common, location: "common" };
  for (let index = 0; index < pages.sheets.length; index += 1) {
    const placement = pages.sheets[index].placements.find(
      ({ id }) => id === placementId,
    );
    if (placement) return { placement, location: index };
  }
  return undefined;
};

/** Canvia la pàgina `index` amb `change`; la resta queda igual. */
export const mapSheet = (
  pages: DocumentPages,
  index: number,
  change: (sheet: DocumentSheet) => DocumentSheet,
): DocumentPages => ({
  ...pages,
  sheets: pages.sheets.map((sheet, i) => (i === index ? change(sheet) : sheet)),
});

const withoutPlacement = (
  pages: DocumentPages,
  placementId: string,
): DocumentPages => ({
  ...pages,
  sheets: pages.sheets.map((sheet) => ({
    ...sheet,
    placements: sheet.placements.filter(({ id }) => id !== placementId),
  })),
  common: pages.common.filter(({ id }) => id !== placementId),
});

/**
 * Una còpia independent d'un bloc, amb un `id` nou. Fora de la seva pàgina,
 * l'espai de la plantilla d'on venia ja no vol dir res, i no se'l queda.
 */
const copyOf = (
  placement: PagePlacement,
  newId: NewLayoutId,
  keepSlot: boolean,
): PagePlacement => {
  const id = newId("pl");
  if (!isBoxed(placement))
    return { ...placement, id, raw: { ...placement.raw, id } };
  const copy = { ...placement, id };
  if (!keepSlot) delete copy.slot;
  return copy;
};

/** El bloc sense l'espai de la plantilla: per als que surten de la seva pàgina. */
const withoutSlot = (placement: PagePlacement): PagePlacement => {
  if (!isBoxed(placement) || placement.slot === undefined) return placement;
  const rest = { ...placement };
  delete rest.slot;
  return rest;
};

// --- Pàgines ---

/** Una pàgina buida just després de `afterIndex`. Els comuns ja hi surten sols. */
export const addSheet = (
  pages: DocumentPages,
  afterIndex: number,
  newId: NewLayoutId,
  mode: SheetMode,
): DocumentPages => {
  const sheets = [...pages.sheets];
  sheets.splice(afterIndex + 1, 0, emptySheet(newId, mode));
  return { ...pages, sheets };
};

/**
 * Una còpia de la pàgina just després de l'original, amb la mateixa plantilla
 * i les mateixes caixes. Els blocs de la còpia són nous i independents: moure'n
 * un no mou l'altre.
 */
export const duplicateSheet = (
  pages: DocumentPages,
  index: number,
  newId: NewLayoutId,
): DocumentPages => {
  const original = pages.sheets[index];
  if (!original) return pages;
  const copy: DocumentSheet = {
    ...original,
    id: newId("sh"),
    placements: original.placements.map((placement) =>
      copyOf(placement, newId, true),
    ),
  };
  const sheets = [...pages.sheets];
  sheets.splice(index + 1, 0, copy);
  return { ...pages, sheets };
};

/**
 * Treu la pàgina i els seus blocs. Un document té sempre una pàgina com a
 * mínim: si era l'única, en queda una de buida, del mateix mode, en el seu lloc.
 */
export const removeSheet = (
  pages: DocumentPages,
  index: number,
  newId: NewLayoutId,
): DocumentPages => {
  const removed = pages.sheets[index];
  if (!removed) return pages;
  const sheets = pages.sheets.filter((_, i) => i !== index);
  return {
    ...pages,
    sheets: sheets.length > 0 ? sheets : [emptySheet(newId, removed.mode)],
  };
};

/** Canvia la pàgina de lloc: la de `from` passa a ser a `to`. */
export const moveSheet = (
  pages: DocumentPages,
  from: number,
  to: number,
): DocumentPages => {
  const sheet = pages.sheets[from];
  if (!sheet || to < 0 || to >= pages.sheets.length) return pages;
  const sheets = pages.sheets.filter((_, i) => i !== from);
  sheets.splice(to, 0, sheet);
  return { ...pages, sheets };
};

// --- Blocs ---

/** Posa el bloc a la pàgina. Si ja era en un altre lloc, no el treu d'allà. */
export const addPlacement = (
  pages: DocumentPages,
  sheetIndex: number,
  placement: PagePlacement,
): DocumentPages =>
  mapSheet(pages, sheetIndex, (sheet) => ({
    ...sheet,
    placements: [...sheet.placements, placement],
  }));

/** Canvia el bloc allà on sigui (moure, redimensionar, columnes…). */
export const updatePlacement = (
  pages: DocumentPages,
  placementId: string,
  change: (placement: PagePlacement) => PagePlacement,
): DocumentPages => {
  const apply = (list: PagePlacement[]): PagePlacement[] =>
    list.map((placement) =>
      placement.id === placementId ? change(placement) : placement,
    );
  return {
    ...pages,
    sheets: pages.sheets.map((sheet) => ({
      ...sheet,
      placements: apply(sheet.placements),
    })),
    common: apply(pages.common),
  };
};

/**
 * Treu **aquest** bloc, i prou. La seqüència continua al document i a les
 * altres pàgines on surti; si era l'últim, queda sense col·locar.
 */
export const removePlacement = withoutPlacement;

/**
 * Una còpia del bloc a la pàgina triada, a la mateixa posició i mida. És
 * independent de l'original: «Copia a la pàgina…».
 */
export const copyPlacementToSheet = (
  pages: DocumentPages,
  placementId: string,
  sheetIndex: number,
  newId: NewLayoutId,
): DocumentPages => {
  const found = findPlacement(pages, placementId);
  if (!found || !pages.sheets[sheetIndex]) return pages;
  return addPlacement(pages, sheetIndex, copyOf(found.placement, newId, false));
};

/**
 * «A totes les pàgines»: el bloc passa de la seva pàgina als comuns, i a partir
 * d'aquí surt a totes les pàgines al mateix lloc.
 */
export const makeCommon = (
  pages: DocumentPages,
  placementId: string,
): DocumentPages => {
  const found = findPlacement(pages, placementId);
  if (!found || found.location === "common") return pages;
  const without = withoutPlacement(pages, placementId);
  return {
    ...without,
    common: [...without.common, withoutSlot(found.placement)],
  };
};

/**
 * Desfà «A totes les pàgines»: el bloc es queda només a la pàgina on s'és, i
 * desapareix de la resta.
 */
export const makeLocal = (
  pages: DocumentPages,
  placementId: string,
  sheetIndex: number,
): DocumentPages => {
  const found = findPlacement(pages, placementId);
  if (!found || found.location !== "common" || !pages.sheets[sheetIndex])
    return pages;
  return addPlacement(
    withoutPlacement(pages, placementId),
    sheetIndex,
    found.placement,
  );
};

/**
 * Treu tots els blocs d'una seqüència: el que cal quan s'esborra la seqüència
 * del document. Els blocs de text i els que l'app no entén es queden.
 */
export const removeSequencePlacements = (
  pages: DocumentPages,
  sequenceKey: number,
): DocumentPages => {
  const keep = (placement: PagePlacement) =>
    placement.kind !== "sequence" || placement.sequenceKey !== sequenceKey;
  return {
    ...pages,
    sheets: pages.sheets.map((sheet) => ({
      ...sheet,
      placements: sheet.placements.filter(keep),
    })),
    common: pages.common.filter(keep),
  };
};
