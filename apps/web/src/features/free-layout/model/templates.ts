// Les plantilles de distribució d'una pàgina. Una plantilla és una llista
// d'espais en **fraccions** de la regió lliure (0–1); en aplicar-la, cada bloc
// de la pàgina va a un espai, en ordre de lectura. La pàgina recorda quina
// plantilla té (`DocumentSheet.template`) i quin espai ocupa cada bloc
// (`slot`), i afegir-hi un bloc n'omple el primer espai lliure (R2).
// Vegeu `docs/decisions/ADR-005-disposicio-lliure.md`.
import type { SequenceDirection } from "@/types/ui";
import type { PagePlacement } from "@/types/document";
import { Box, SheetArea, isBoxed } from "./placement";
import { sortByReadingOrder } from "./readingOrder";

/** Espai entre dues caixes veïnes d'una plantilla. */
export const TEMPLATE_GAP_MM = 5;

/** Un espai de la plantilla, en fraccions de la regió (0–1). */
export interface TemplateSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutTemplate {
  /** Identificador estable: és la clau del nom traduït de la plantilla */
  id: string;
  slots: TemplateSlot[];
}

/** `n` caixes apilades: en files (una sota l'altra) o en columnes. */
export const stackTemplate = (
  n: number,
  axis: "rows" | "columns",
): LayoutTemplate => ({
  id: n === 1 ? "full" : `${axis}-${n}`,
  slots: Array.from({ length: n }, (_, index) =>
    axis === "rows"
      ? { x: 0, y: index / n, w: 1, h: 1 / n }
      : { x: index / n, y: 0, w: 1 / n, h: 1 },
  ),
});

/** Una graella tan quadrada com es pugui amb `n` espais com a mínim. */
export const gridTemplate = (n: number): LayoutTemplate => {
  const columns = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / columns);
  return {
    id: `grid-${columns}x${rows}`,
    slots: Array.from({ length: columns * rows }, (_, index) => ({
      x: (index % columns) / columns,
      y: Math.floor(index / columns) / rows,
      w: 1 / columns,
      h: 1 / rows,
    })),
  };
};

/** Una tira estreta a dalt (un quart) i un espai gran a sota. */
const STRIP_TOP: LayoutTemplate = {
  id: "strip-top",
  slots: [
    { x: 0, y: 0, w: 1, h: 0.25 },
    { x: 0, y: 0.25, w: 1, h: 0.75 },
  ],
};

/** Les plantilles que es poden triar, en l'ordre del selector. */
export const TEMPLATE_CHOICES: readonly LayoutTemplate[] = [
  stackTemplate(1, "rows"),
  stackTemplate(2, "rows"),
  stackTemplate(2, "columns"),
  stackTemplate(3, "rows"),
  gridTemplate(4),
  STRIP_TOP,
];

/** Les plantilles del selector on caben `count` caixes. */
export const templatesFor = (count: number): LayoutTemplate[] =>
  TEMPLATE_CHOICES.filter(({ slots }) => slots.length >= count);

/**
 * La plantilla que toca per a `count` caixes, sense triar-ne cap: la que fa
 * servir afegir una seqüència a un full i la disposició de partida. Fins a
 * tres, apilades com el flux (en files o en columnes, segons la direcció de la
 * pàgina); a partir de quatre, una graella.
 */
export const templateFor = (
  count: number,
  direction: SequenceDirection,
): LayoutTemplate => {
  if (count <= 1) return stackTemplate(1, "rows");
  if (count <= 3)
    return stackTemplate(count, direction === "row" ? "rows" : "columns");
  return gridTemplate(count);
};

/**
 * Un espai de la plantilla convertit en caixa dins de la regió. Entre dos
 * espais veïns queda `gap` mm; a les vores de la regió, res.
 */
export const slotToBox = (
  slot: TemplateSlot,
  region: Box,
  gap = TEMPLATE_GAP_MM,
): Box => {
  const half = gap / 2;
  const left = region.x + slot.x * region.w + (slot.x > 0 ? half : 0);
  const right =
    region.x + (slot.x + slot.w) * region.w - (slot.x + slot.w < 1 ? half : 0);
  const top = region.y + slot.y * region.h + (slot.y > 0 ? half : 0);
  const bottom =
    region.y + (slot.y + slot.h) * region.h - (slot.y + slot.h < 1 ? half : 0);
  return { x: left, y: top, w: right - left, h: bottom - top };
};

/**
 * La part del full que deixen lliure les col·locacions comunes.
 *
 * Les comunes solen ser una capçalera o un peu: una franja a dalt o a baix.
 * Les que tenen el centre a la meitat de dalt empenyen la regió cap avall, i les
 * de la meitat de baix l'escurcen per sota; la regió fa sempre tota l'amplada.
 * Una comuna a un costat no la redueix: per a això hi ha el retoc a mà.
 */
export const freeRegion = (
  area: SheetArea,
  common: readonly Box[],
  gap = TEMPLATE_GAP_MM,
): Box => {
  let top = 0;
  let bottom = area.h;
  common.forEach((box) => {
    if (box.y + box.h / 2 < area.h / 2)
      top = Math.max(top, box.y + box.h + gap);
    else bottom = Math.min(bottom, box.y - gap);
  });
  // Si les comunes s'ho mengen tot, la regió és el full sencer: val més
  // trepitjar-les que deixar caixes sense lloc
  if (bottom - top <= 0) return { x: 0, y: 0, w: area.w, h: area.h };
  return { x: 0, y: top, w: area.w, h: bottom - top };
};

/** La caixa i l'espai de la plantilla que pren un bloc. */
export type SlotBox = Box & { slot: number };

/**
 * La caixa de cada bloc, espai per espai en l'ordre de `ordered`. Els que no
 * hi caben no en reben cap.
 */
export const assignSlots = (
  ordered: readonly { id: string }[],
  template: LayoutTemplate,
  region: Box,
): Map<string, SlotBox> =>
  new Map(
    ordered
      .slice(0, template.slots.length)
      .map((placement, index) => [
        placement.id,
        { ...slotToBox(template.slots[index], region), slot: index },
      ]),
  );

/**
 * Els blocs amb la caixa i l'espai nous que en tinguin; l'ordre de la llista
 * no canvia. Els que l'app no entén no en tenen, i es queden com eren.
 */
export const withBoxes = <T extends PagePlacement>(
  placements: readonly T[],
  boxOf: ReadonlyMap<string, SlotBox>,
): T[] =>
  placements.map((placement) => {
    const box = isBoxed(placement) ? boxOf.get(placement.id) : undefined;
    return box ? { ...placement, ...box } : placement;
  });

/**
 * Els blocs d'una pàgina repartits en la plantilla, en ordre de lectura. Si
 * n'hi ha més que espais, els que sobren es queden on eren: el selector només
 * ofereix les plantilles on hi caben tots (`templatesFor`). El canvi és de
 * lloc, no d'ordre: la llista queda com era.
 */
export const applyTemplate = <T extends PagePlacement>(
  placements: readonly T[],
  template: LayoutTemplate,
  region: Box,
): T[] =>
  withBoxes(
    placements,
    assignSlots(
      sortByReadingOrder(
        placements.flatMap((placement) =>
          isBoxed(placement) ? [placement] : [],
        ),
      ),
      template,
      region,
    ),
  );

/**
 * La plantilla d'un `id`, si l'app la coneix: les del selector i les que fa
 * `templateFor` (`rows-5`, `columns-4`, `grid-3x2`…). Una pàgina pot portar
 * l'`id` d'una plantilla d'una versió posterior: es conserva, però no s'hi pot
 * afegir res a l'espai lliure.
 */
export const templateById = (id: string): LayoutTemplate | undefined => {
  const choice = TEMPLATE_CHOICES.find((template) => template.id === id);
  if (choice) return choice;
  const stack = /^(rows|columns)-([1-9][0-9]?)$/.exec(id);
  if (stack)
    return stackTemplate(Number(stack[2]), stack[1] as "rows" | "columns");
  const grid = /^grid-([1-9])x([1-9])$/.exec(id);
  if (grid) {
    const template = gridTemplate(Number(grid[1]) * Number(grid[2]));
    return template.id === id ? template : undefined;
  }
  return undefined;
};

/** Els espais de la plantilla que cap bloc no ocupa, en ordre. */
export const freeSlots = (
  template: LayoutTemplate,
  placements: readonly PagePlacement[],
): number[] => {
  const taken = new Set(
    placements.flatMap((placement) =>
      isBoxed(placement) && placement.slot !== undefined
        ? [placement.slot]
        : [],
    ),
  );
  return template.slots.flatMap((_, index) =>
    taken.has(index) ? [] : [index],
  );
};
