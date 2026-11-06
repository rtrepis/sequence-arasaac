// Repartir caixes en un full sencer: la disposició de partida en passar a
// «Lliure», afegir seqüències a una pàgina i aplicar-hi una plantilla. Les tres
// fan el mateix: col·locar les caixes del full a la regió que deixen lliure les
// comunes, segons una plantilla. Vegeu `docs/PLA-mode-lliure.md`, §6.
import type {
  FreeLayout,
  PlacementColumns,
  SequencePlacement,
} from "@/types/document";
import type { SequenceDirection } from "@/types/ui";
import type { SheetArea } from "./placement";
import { NewLayoutId } from "./sheets";
import { sortByReadingOrder } from "./readingOrder";
import {
  LayoutTemplate,
  applyTemplate,
  assignSlots,
  freeRegion,
  templateFor,
  withBoxes,
} from "./templates";

/** Quantes seqüències van a cada full de la disposició de partida. */
export const INITIAL_SEQUENCES_PER_SHEET = 3;

const newPlacement = (
  sequenceKey: number,
  newId: NewLayoutId,
  columns: PlacementColumns = "auto",
): SequencePlacement => ({
  id: newId("pl"),
  sequenceKey,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  columns,
});

/**
 * Aplica la plantilla a un full: les seves caixes es reparteixen, en ordre de
 * lectura, a la regió que deixen lliure les comunes. Substitueix els retocs a
 * mà d'aquell full, i per això qui ho ofereix ho ha de poder desfer.
 */
export const applyTemplateToSheet = (
  layout: FreeLayout,
  sheetIndex: number,
  template: LayoutTemplate,
  area: SheetArea,
): FreeLayout => {
  const sheet = layout.sheets[sheetIndex];
  if (!sheet) return layout;
  const region = freeRegion(area, layout.common);
  return {
    ...layout,
    sheets: layout.sheets.map((current, index) =>
      index === sheetIndex
        ? {
            ...current,
            placements: applyTemplate(current.placements, template, region),
          }
        : current,
    ),
  };
};

/**
 * Afegeix les seqüències al full i el torna a repartir amb la plantilla que
 * toca per al nombre nou de caixes. Les seqüències no surten d'on eren: en fa
 * una col·locació nova a aquest full, encara que ja en tinguin en un altre.
 */
export const addSequencesToSheet = (
  layout: FreeLayout,
  sheetIndex: number,
  sequenceKeys: readonly number[],
  context: {
    area: SheetArea;
    direction: SequenceDirection;
    newId: NewLayoutId;
  },
): FreeLayout => {
  const sheet = layout.sheets[sheetIndex];
  if (!sheet || sequenceKeys.length === 0) return layout;
  const added = sequenceKeys.map((key) => newPlacement(key, context.newId));
  const placements = [...sheet.placements, ...added];
  // Les que ja hi eren, en ordre de lectura; les noves, al final
  const ordered = [...sortByReadingOrder(sheet.placements), ...added];
  const boxOf = assignSlots(
    ordered,
    templateFor(placements.length, context.direction),
    freeRegion(context.area, layout.common),
  );
  return {
    ...layout,
    sheets: layout.sheets.map((current, index) =>
      index === sheetIndex
        ? { ...current, placements: withBoxes(placements, boxOf) }
        : current,
    ),
  };
};

/**
 * La disposició en passar a «Lliure» per primer cop: totes les seqüències,
 * apilades com al flux (en files o en columnes, segons la direcció de la
 * pàgina), de `INITIAL_SEQUENCES_PER_SHEET` en `INITIAL_SEQUENCES_PER_SHEET`
 * per full. Així no desapareix res del full, i a partir d'aquí l'usuari les
 * mou, les treu o n'afegeix pàgina a pàgina.
 */
export const buildInitialLayout = (
  sequenceKeys: readonly number[],
  context: {
    area: SheetArea;
    direction: SequenceDirection;
    newId: NewLayoutId;
  },
): FreeLayout => {
  const groups: number[][] = [];
  for (let i = 0; i < sequenceKeys.length; i += INITIAL_SEQUENCES_PER_SHEET)
    groups.push(sequenceKeys.slice(i, i + INITIAL_SEQUENCES_PER_SHEET));
  if (groups.length === 0) groups.push([]);

  const empty: FreeLayout = {
    sheets: groups.map(() => ({ id: context.newId("sh"), placements: [] })),
    common: [],
  };
  return groups.reduce(
    (layout, keys, sheetIndex) =>
      addSequencesToSheet(layout, sheetIndex, keys, context),
    empty,
  );
};
