// Operacions sobre la disposició lliure: fulls i col·locacions. Totes són pures
// (retornen una disposició nova i no toquen la que reben), i els identificadors
// nous els dona qui crida, perquè les proves puguin fixar-los.
// Vegeu `docs/PLA-mode-lliure.md`, §6.
import type {
  FreeLayout,
  FreeSheet,
  SequencePlacement,
} from "@/types/document";

/** Genera un identificador nou: `"sh"` per a un full, `"pl"` per a una col·locació. */
export type NewLayoutId = (prefix: "sh" | "pl") => string;

/** On és una col·locació: en un full (el seu índex) o a les comunes. */
export type PlacementLocation = number | "common";

/** Una disposició amb un sol full buit: la d'un document sense res col·locat. */
export const emptyFreeLayout = (newId: NewLayoutId): FreeLayout => ({
  sheets: [{ id: newId("sh"), placements: [] }],
  common: [],
});

/** La col·locació amb aquest `id`, i on és. */
export const findPlacement = (
  layout: FreeLayout,
  placementId: string,
):
  | { placement: SequencePlacement; location: PlacementLocation }
  | undefined => {
  const common = layout.common.find(({ id }) => id === placementId);
  if (common) return { placement: common, location: "common" };
  for (let index = 0; index < layout.sheets.length; index += 1) {
    const placement = layout.sheets[index].placements.find(
      ({ id }) => id === placementId,
    );
    if (placement) return { placement, location: index };
  }
  return undefined;
};

const mapSheet = (
  layout: FreeLayout,
  index: number,
  change: (sheet: FreeSheet) => FreeSheet,
): FreeLayout => ({
  ...layout,
  sheets: layout.sheets.map((sheet, i) =>
    i === index ? change(sheet) : sheet,
  ),
});

const withoutPlacement = (
  layout: FreeLayout,
  placementId: string,
): FreeLayout => ({
  sheets: layout.sheets.map((sheet) => ({
    ...sheet,
    placements: sheet.placements.filter(({ id }) => id !== placementId),
  })),
  common: layout.common.filter(({ id }) => id !== placementId),
});

// --- Fulls ---

/** Un full buit just després de `afterIndex`. Les comunes ja hi surten soles. */
export const addSheet = (
  layout: FreeLayout,
  afterIndex: number,
  newId: NewLayoutId,
): FreeLayout => {
  const sheets = [...layout.sheets];
  sheets.splice(afterIndex + 1, 0, { id: newId("sh"), placements: [] });
  return { ...layout, sheets };
};

/**
 * Una còpia del full just després de l'original, amb les mateixes caixes. Les
 * col·locacions de la còpia són noves i independents: moure'n una no mou l'altra.
 */
export const duplicateSheet = (
  layout: FreeLayout,
  index: number,
  newId: NewLayoutId,
): FreeLayout => {
  const original = layout.sheets[index];
  if (!original) return layout;
  const copy: FreeSheet = {
    ...original,
    id: newId("sh"),
    placements: original.placements.map((placement) => ({
      ...placement,
      id: newId("pl"),
    })),
  };
  const sheets = [...layout.sheets];
  sheets.splice(index + 1, 0, copy);
  return { ...layout, sheets };
};

/**
 * Treu el full i les seves col·locacions. Un document en mode lliure té sempre
 * un full com a mínim: si era l'únic, en queda un de buit en el seu lloc.
 */
export const removeSheet = (
  layout: FreeLayout,
  index: number,
  newId: NewLayoutId,
): FreeLayout => {
  if (!layout.sheets[index]) return layout;
  const sheets = layout.sheets.filter((_, i) => i !== index);
  return {
    ...layout,
    sheets: sheets.length > 0 ? sheets : [{ id: newId("sh"), placements: [] }],
  };
};

/** Canvia el full de lloc: el de `from` passa a ser a `to`. */
export const moveSheet = (
  layout: FreeLayout,
  from: number,
  to: number,
): FreeLayout => {
  const sheet = layout.sheets[from];
  if (!sheet || to < 0 || to >= layout.sheets.length) return layout;
  const sheets = layout.sheets.filter((_, i) => i !== from);
  sheets.splice(to, 0, sheet);
  return { ...layout, sheets };
};

// --- Col·locacions ---

/** Posa la col·locació al full. Si ja era en un altre lloc, no la treu d'allà. */
export const addPlacement = (
  layout: FreeLayout,
  sheetIndex: number,
  placement: SequencePlacement,
): FreeLayout =>
  mapSheet(layout, sheetIndex, (sheet) => ({
    ...sheet,
    placements: [...sheet.placements, placement],
  }));

/** Canvia la col·locació allà on sigui (moure, redimensionar, columnes…). */
export const updatePlacement = (
  layout: FreeLayout,
  placementId: string,
  change: (placement: SequencePlacement) => SequencePlacement,
): FreeLayout => {
  const apply = (list: SequencePlacement[]): SequencePlacement[] =>
    list.map((placement) =>
      placement.id === placementId ? change(placement) : placement,
    );
  return {
    sheets: layout.sheets.map((sheet) => ({
      ...sheet,
      placements: apply(sheet.placements),
    })),
    common: apply(layout.common),
  };
};

/**
 * Treu **aquesta** col·locació, i prou. La seqüència continua al document i a
 * les altres pàgines on surti; si era l'última, queda sense col·locar.
 */
export const removePlacement = withoutPlacement;

/**
 * Una còpia de la col·locació al full triat, a la mateixa posició i mida. És
 * independent de l'original: «Copia a la pàgina…».
 */
export const copyPlacementToSheet = (
  layout: FreeLayout,
  placementId: string,
  sheetIndex: number,
  newId: NewLayoutId,
): FreeLayout => {
  const found = findPlacement(layout, placementId);
  if (!found || !layout.sheets[sheetIndex]) return layout;
  return addPlacement(layout, sheetIndex, {
    ...found.placement,
    id: newId("pl"),
  });
};

/**
 * «A totes les pàgines»: la col·locació passa del seu full a les comunes, i a
 * partir d'aquí surt a tots els fulls al mateix lloc.
 */
export const makeCommon = (
  layout: FreeLayout,
  placementId: string,
): FreeLayout => {
  const found = findPlacement(layout, placementId);
  if (!found || found.location === "common") return layout;
  const without = withoutPlacement(layout, placementId);
  return { ...without, common: [...without.common, found.placement] };
};

/**
 * Desfà «A totes les pàgines»: la col·locació es queda només al full on s'és, i
 * desapareix de la resta.
 */
export const makeLocal = (
  layout: FreeLayout,
  placementId: string,
  sheetIndex: number,
): FreeLayout => {
  const found = findPlacement(layout, placementId);
  if (!found || found.location !== "common" || !layout.sheets[sheetIndex])
    return layout;
  return addPlacement(
    withoutPlacement(layout, placementId),
    sheetIndex,
    found.placement,
  );
};

/**
 * Treu totes les col·locacions d'una seqüència: el que cal quan s'esborra la
 * seqüència del document.
 */
export const removeSequencePlacements = (
  layout: FreeLayout,
  sequenceKey: number,
): FreeLayout => {
  const keep = ({ sequenceKey: key }: SequencePlacement) => key !== sequenceKey;
  return {
    sheets: layout.sheets.map((sheet) => ({
      ...sheet,
      placements: sheet.placements.filter(keep),
    })),
    common: layout.common.filter(keep),
  };
};
