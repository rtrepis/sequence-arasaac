// Repartir els blocs d'una pàgina: aplicar-hi una plantilla, afegir-hi
// seqüències, la disposició de partida en passar a «Lliure» i el pas d'una
// pàgina automàtica a una amb caixes. Totes col·loquen els blocs a la regió que
// deixen lliure els comuns, segons la plantilla de la pàgina, i la pàgina es
// queda la plantilla (R2). Vegeu `docs/decisions/ADR-005-disposicio-lliure.md`.
import type {
  DocumentPages,
  DocumentSheet,
  PlacementColumns,
  SequencePlacement,
  TextPlacement,
} from "@/types/document";
import type { SequenceDirection } from "@/types/ui";
import { SheetArea, hasBox, isBoxed } from "./placement";
import { NewLayoutId, mapSheet } from "./sheets";
import { sortByReadingOrder } from "./readingOrder";
import {
  LayoutTemplate,
  SlotBox,
  applyTemplate,
  arrangementOf,
  assignSlots,
  freeRegion,
  freeSlots,
  overflowOf,
  slotToBox,
  templateById,
  templateFor,
  withBoxes,
} from "./templates";

/** Quantes seqüències van a cada pàgina de la disposició de partida. */
export const INITIAL_SEQUENCES_PER_SHEET = 3;

/** El que cal per repartir blocs. */
export interface DistributeContext {
  area: SheetArea;
  /** La direcció de les pàgines automàtiques: decideix files o columnes */
  direction: SequenceDirection;
  newId: NewLayoutId;
}

/** Un bloc de seqüència nou, encara sense caixa. */
export const newSequencePlacement = (
  sequenceKey: number,
  newId: NewLayoutId,
  columns: PlacementColumns = "auto",
): SequencePlacement => ({
  kind: "sequence",
  id: newId("pl"),
  sequenceKey,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  columns,
});

/**
 * La mida de la lletra amb què neix el rètol d'una plantilla, sobre la de les
 * targetes: un rètol és un títol, i a la mida del text d'una targeta es perdria.
 */
export const NEW_LABEL_FONT_SIZE = 1.25;

/** Un rètol nou, encara sense caixa: en negreta i més gran que el text de les targetes. */
export const newTextPlacement = (
  text: string,
  newId: NewLayoutId,
): TextPlacement => ({
  kind: "text",
  id: newId("pl"),
  text,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  textStyle: { bold: true, font: { size: NEW_LABEL_FONT_SIZE } },
});

/**
 * El que cal per omplir els espais de rètol buits d'una plantilla: el text
 * amb què neix cada rètol (per la clau de l'espai, ja traduït a l'idioma de la
 * interfície) i els identificadors nous.
 */
export interface LabelContext {
  text: (label: string) => string;
  newId: NewLayoutId;
}

/**
 * La pàgina amb la plantilla aplicada: els seus blocs es reparteixen, en ordre
 * de lectura, a la regió que deixen lliure els comuns, i la pàgina passa a
 * tenir caixes i a recordar la plantilla. Substitueix els retocs a mà d'aquella
 * pàgina, i per això qui ho ofereix ho ha de poder desfer. Amb `labels`, els
 * espais de rètol que queden buits n'estrenen un («Primer», «Dilluns»…).
 */
const sheetWithTemplate = (
  sheet: DocumentSheet,
  template: LayoutTemplate,
  pages: DocumentPages,
  area: SheetArea,
  labels?: LabelContext,
): DocumentSheet => {
  const region = freeRegion(area, pages.common.filter(isBoxed));
  // Els que no hi caben surten de la pàgina: qui ho ofereix ho ha avisat abans
  // (`overflowOf`). La seqüència continua al document
  const dropped = new Set(overflowOf(template, sheet.placements));
  const placements = applyTemplate(
    sheet.placements.filter(({ id }) => !dropped.has(id)),
    template,
    region,
  );
  const created: TextPlacement[] = labels
    ? freeSlots(template, placements, "text").map((index) => {
        const slot = template.slots[index];
        return {
          ...newTextPlacement(
            slot.label ? labels.text(slot.label) : "",
            labels.newId,
          ),
          ...slotToBox(slot, region),
          slot: index,
        };
      })
    : [];
  return {
    ...sheet,
    mode: "template",
    template: template.id,
    placements: [...placements, ...created],
  };
};

/** Aplica la plantilla a una pàgina (vegeu `sheetWithTemplate`). */
export const applyTemplateToSheet = (
  pages: DocumentPages,
  sheetIndex: number,
  template: LayoutTemplate,
  area: SheetArea,
  labels?: LabelContext,
): DocumentPages =>
  pages.sheets[sheetIndex]
    ? mapSheet(pages, sheetIndex, (sheet) =>
        sheetWithTemplate(sheet, template, pages, area, labels),
      )
    : pages;

/**
 * Afegeix blocs nous (encara sense caixa) a una pàgina. Els blocs que hi eren
 * no surten d'on eren.
 *
 * - **Pàgina automàtica**: van al final, un darrere l'altre.
 * - **Pàgina amb plantilla** (R2): omplen els espais lliures de la plantilla que
 *   té, en ordre, i els blocs que ja hi eren no es mouen. Una seqüència només va
 *   als espais de seqüència; un rètol, primer als de rètol i després als altres.
 *   Amb `slot`, el primer bloc va a aquell espai si és lliure (un bloc buit del
 *   full, R4). Si no hi caben, o la pàgina no té cap plantilla que l'app
 *   conegui, es torna a repartir sencera amb la plantilla que toca per al
 *   nombre nou de blocs, que passa a ser la seva.
 */
export const addPlacementsToSheet = (
  pages: DocumentPages,
  sheetIndex: number,
  added: readonly (SequencePlacement | TextPlacement)[],
  context: DistributeContext,
  slot?: number,
): DocumentPages => {
  const sheet = pages.sheets[sheetIndex];
  if (!sheet || added.length === 0) return pages;
  const placements = [...sheet.placements, ...added];
  if (sheet.mode === "auto")
    return mapSheet(pages, sheetIndex, () => ({ ...sheet, placements }));

  const region = freeRegion(context.area, pages.common.filter(isBoxed));
  const template = sheet.template
    ? templateById(sheet.template, sheet.placements.filter(isBoxed).length)
    : undefined;
  if (template) {
    const taken = new Set<number>();
    const pick = (
      placement: SequencePlacement | TextPlacement,
      index: number,
    ): number | undefined => {
      const free = (kind?: "sequence" | "text") =>
        freeSlots(template, sheet.placements, kind).filter(
          (candidate) => !taken.has(candidate),
        );
      if (index === 0 && slot !== undefined && free().includes(slot))
        return slot;
      return placement.kind === "text"
        ? (free("text")[0] ?? free("sequence")[0])
        : free("sequence")[0];
    };
    const chosen = added.map((placement, index) => {
      const found = pick(placement, index);
      if (found !== undefined) taken.add(found);
      return found;
    });
    if (chosen.every((found) => found !== undefined)) {
      const boxOf = new Map<string, SlotBox>(
        added.map((placement, index) => {
          const found = chosen[index] as number;
          return [
            placement.id,
            { ...slotToBox(template.slots[found], region), slot: found },
          ];
        }),
      );
      return mapSheet(pages, sheetIndex, () => ({
        ...sheet,
        placements: withBoxes(placements, boxOf),
      }));
    }
  }

  // Els que ja hi eren, en ordre de lectura; els nous, al final
  const boxed = placements.filter(isBoxed);
  // «X columnes» o «Y files» creix amb els blocs nous; les altres plantilles
  // passen a la que toca pel nombre de blocs
  const grown =
    sheet.template && arrangementOf(sheet.template).kind !== "template"
      ? templateById(sheet.template, boxed.length)
      : undefined;
  const next = grown ?? templateFor(boxed.length, context.direction);
  const ordered = [
    ...sortByReadingOrder(sheet.placements.filter(isBoxed)),
    ...added,
  ];
  return mapSheet(pages, sheetIndex, () => ({
    ...sheet,
    template: next.id,
    placements: withBoxes(placements, assignSlots(ordered, next, region)),
  }));
};

/**
 * Afegeix les seqüències a una pàgina (`addPlacementsToSheet`). Les seqüències
 * no surten d'on eren: en fa un bloc nou a aquesta pàgina, encara que ja en
 * tinguin en una altra.
 */
export const addSequencesToSheet = (
  pages: DocumentPages,
  sheetIndex: number,
  sequenceKeys: readonly number[],
  context: DistributeContext,
  slot?: number,
): DocumentPages =>
  addPlacementsToSheet(
    pages,
    sheetIndex,
    sequenceKeys.map((key) => newSequencePlacement(key, context.newId)),
    context,
    slot,
  );

/**
 * La pàgina, amb caixes. Una pàgina que ja en té no canvia. Una d'automàtica:
 * - si és buida, o si els seus blocs ja tenen caixa (la pàgina en tenia i va
 *   passar a automàtica en aquesta sessió), la recupera tal com era;
 * - si no, es reparteix amb la plantilla que recordava, si l'app la coneix i
 *   hi caben tots els blocs, i si no amb la que toca pel nombre de blocs.
 */
export const sheetToTemplate = (
  sheet: DocumentSheet,
  pages: DocumentPages,
  context: Omit<DistributeContext, "newId">,
): DocumentSheet => {
  if (sheet.mode === "template") return sheet;
  const boxed = sheet.placements.filter(isBoxed);
  if (boxed.every(hasBox)) return { ...sheet, mode: "template" };
  const remembered = sheet.template
    ? templateById(sheet.template, boxed.length)
    : undefined;
  const template =
    remembered && remembered.slots.length >= boxed.length
      ? remembered
      : templateFor(boxed.length, sheet.direction ?? context.direction);
  return sheetWithTemplate(sheet, template, pages, context.area);
};

/**
 * La disposició de partida en passar a «Lliure» un document que no tenia
 * pàgines: totes les seqüències, apilades com al flux (en files o en columnes,
 * segons la direcció de la pàgina), de `INITIAL_SEQUENCES_PER_SHEET` en
 * `INITIAL_SEQUENCES_PER_SHEET` per pàgina. Així no desapareix res del full, i
 * a partir d'aquí l'usuari les mou, les treu o n'afegeix pàgina a pàgina.
 */
export const buildInitialPages = (
  sequenceKeys: readonly number[],
  context: DistributeContext,
): DocumentPages => {
  const groups: number[][] = [];
  for (let i = 0; i < sequenceKeys.length; i += INITIAL_SEQUENCES_PER_SHEET)
    groups.push(sequenceKeys.slice(i, i + INITIAL_SEQUENCES_PER_SHEET));
  if (groups.length === 0) groups.push([]);

  const empty: DocumentPages = {
    sheets: groups.map(() => ({
      id: context.newId("sh"),
      mode: "template",
      placements: [],
    })),
    common: [],
  };
  return groups.reduce(
    (pages, keys, sheetIndex) =>
      addSequencesToSheet(pages, sheetIndex, keys, context),
    empty,
  );
};
