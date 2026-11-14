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

/**
 * Què va a un espai: un bloc de seqüència o un rètol (un bloc de text, R9).
 * Sense valor, de seqüència.
 */
export type SlotKind = "sequence" | "text";

/** Un espai de la plantilla, en fraccions de la regió (0–1). */
export interface TemplateSlot {
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: SlotKind;
  /**
   * El text amb què neix el rètol d'aquest espai («Primer», «Dilluns»…): la
   * clau del text traduït (`TEMPLATE_SLOT_TEXTS`). Un cop creat, és contingut
   * del document i ja no es tradueix
   */
  label?: string;
}

export interface LayoutTemplate {
  /** Identificador estable: és la clau del nom traduït de la plantilla */
  id: string;
  slots: TemplateSlot[];
  /** Si queda millor en paper apaïsat (R3: la setmana, «Primer / Després») */
  landscape?: boolean;
}

/** Què va a l'espai. */
export const slotKind = (slot: TemplateSlot): SlotKind =>
  slot.kind ?? "sequence";

/** Si la plantilla té espais de rètol. */
export const hasTextSlots = (template: LayoutTemplate): boolean =>
  template.slots.some((slot) => slotKind(slot) === "text");

/** `n` caixes apilades: en files (una sota l'altra) o en columnes. */
/** Quantes columnes o files com a molt es poden triar. */
export const MAX_LINES = 6;

export const stackTemplate = (
  n: number,
  axis: "rows" | "columns",
): LayoutTemplate => ({
  // També amb una sola caixa: «1 fila» i «1 columna» no pinten igual els
  // pictogrames de dins (`resolveColumns`), i l'id ha de dir quina és
  id: `${axis}-${n}`,
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

/** Una graella de `columns` × `rows` espais, d'esquerra a dreta i de dalt a baix. */
export const fixedGrid = (columns: number, rows: number): LayoutTemplate => ({
  id: `grid-${columns}x${rows}`,
  slots: Array.from({ length: columns * rows }, (_, index) => ({
    x: (index % columns) / columns,
    y: Math.floor(index / columns) / rows,
    w: 1 / columns,
    h: 1 / rows,
  })),
});

/**
 * El repartiment «X columnes» o «Y files» d'una pàgina en blocs, per a
 * `count` blocs. Amb `columns-N`, N columnes i les files que calguin; amb
 * `rows-N`, N files i les columnes que calguin. Si els blocs hi caben en una
 * fila o una columna, és la pila de sempre (`stackTemplate`), amb el mateix
 * `id`: el repartiment es recorda encara que hi hagi més blocs, i en afegir-ne
 * un, creix.
 */
export const arrangementTemplate = (
  axis: "rows" | "columns",
  n: number,
  count: number,
): LayoutTemplate => {
  const other = Math.max(1, Math.ceil(count / n));
  if (other === 1) return stackTemplate(n, axis);
  const grid = axis === "columns" ? fixedGrid(n, other) : fixedGrid(other, n);
  return { ...grid, id: `${axis}-${n}` };
};

/** El repartiment d'una pàgina en blocs, tal com el tria la columna. */
export type Arrangement =
  | { kind: "columns" | "rows"; n: number }
  | { kind: "template"; id: string | undefined };

/**
 * El repartiment d'un `id` de plantilla: columnes, files o una plantilla (el
 * lliure, `free`, és una plantilla sense espais).
 */
export const arrangementOf = (templateId: string | undefined): Arrangement => {
  const stack = /^(rows|columns)-([1-9][0-9]?)$/.exec(templateId ?? "");
  if (stack)
    return { kind: stack[1] as "rows" | "columns", n: Number(stack[2]) };
  // Una sola caixa és una columna (i una fila)
  if (templateId === "full") return { kind: "columns", n: 1 };
  return { kind: "template", id: templateId };
};

/** Una tira estreta a dalt (un quart) i un espai gran a sota. */
const STRIP_TOP: LayoutTemplate = {
  id: "strip-top",
  slots: [
    { x: 0, y: 0, w: 1, h: 0.25 },
    { x: 0, y: 0.25, w: 1, h: 0.75 },
  ],
};

/**
 * El repartiment lliure: cap espai. Els blocs són on l'usuari els ha posat, i
 * un bloc nou va a l'espai buit més gran, sense moure'n cap (`addPlacementsToSheet`).
 */
export const FREE_TEMPLATE: LayoutTemplate = { id: "free", slots: [] };

/** Una sola caixa que omple la pàgina. */
const FULL: LayoutTemplate = { ...stackTemplate(1, "rows"), id: "full" };

/**
 * `n` files de les 24 de la quadrícula de punts (`grid.ts`): les plantilles hi
 * encaixen, i un bloc mogut a mà pot tornar a quedar on era. Les columnes són
 * vintenes, i els cinquens, els terços de 24 i els 0,3 i 0,15 ja hi cauen.
 */
const row = (n: number): number => n / 24;

/** Un rètol. */
const text = (
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
): TemplateSlot => ({ x, y, w, h, kind: "text", label });

// Les plantilles dels treballs reals (R3, `docs/ESTUDI-treballs-amb-pictogrames.md`).
// Es diuen pel treball, no per la forma, i els espais van en ordre de lectura

/** T2 — Agenda en tira: una tira estreta i llarga al mig del full. */
const AGENDA_STRIP: LayoutTemplate = {
  id: "agenda-strip",
  slots: [{ x: 0.3, y: 0, w: 0.4, h: 1 }],
};

/** T3 — «Avui és» + agenda: el rètol a dalt i l'agenda a sota. */
const TODAY_AGENDA: LayoutTemplate = {
  id: "today-agenda",
  slots: [
    text(0, 0, 1, row(3), "today"),
    { x: 0, y: row(3), w: 1, h: row(21) },
  ],
};

/** T4 — Primer / Després: dos espais iguals, cadascun amb el seu rètol. */
const FIRST_THEN: LayoutTemplate = {
  id: "first-then",
  landscape: true,
  slots: [
    text(0, 0, 0.5, row(4), "first"),
    text(0.5, 0, 0.5, row(4), "then"),
    { x: 0, y: row(4), w: 0.5, h: row(20) },
    { x: 0.5, y: row(4), w: 0.5, h: row(20) },
  ],
};

/** Els dies de la setmana de la plantilla «Setmana», de dilluns a divendres. */
const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

/** T5 — Setmana: cinc columnes, amb el nom del dia a dalt de cadascuna. */
const WEEK: LayoutTemplate = {
  id: "week",
  landscape: true,
  slots: [
    ...WEEKDAYS.map((day, i) => text(i / 5, 0, 1 / 5, row(3), day)),
    ...WEEKDAYS.map((_, i) => ({ x: i / 5, y: row(3), w: 1 / 5, h: row(21) })),
  ],
};

/** T7 — Economia de fitxes: «Treballo per…», la tira de fitxes i el premi gran. */
const TOKEN_BOARD: LayoutTemplate = {
  id: "token-board",
  landscape: true,
  slots: [
    text(0, 0, 1, row(3), "workingFor"),
    { x: 0, y: row(3), w: 1, h: row(7) },
    { x: 0.15, y: row(10), w: 0.7, h: row(14) },
  ],
};

/** T8 — Pàgina de conte: tres frases, una sota l'altra. */
const STORY_PAGE: LayoutTemplate = {
  ...stackTemplate(3, "rows"),
  id: "story-page",
};

/** Una franja del menú: el rètol del plat i, a sota, els pictogrames. */
const MENU_ROW = row(8);
const MENU_LABEL = row(2);

/** T9 — Menú: primer plat, segon plat i postres, cadascun amb el seu rètol. */
const MENU: LayoutTemplate = {
  id: "menu",
  slots: ["firstCourse", "secondCourse", "dessert"].flatMap((label, i) => [
    text(0, i * MENU_ROW, 1, MENU_LABEL, label),
    { x: 0, y: i * MENU_ROW + MENU_LABEL, w: 1, h: MENU_ROW - MENU_LABEL },
  ]),
};

/** Les plantilles que es poden triar, en l'ordre del selector. */
export const TEMPLATE_CHOICES: readonly LayoutTemplate[] = [
  FULL,
  stackTemplate(2, "rows"),
  stackTemplate(2, "columns"),
  stackTemplate(3, "rows"),
  gridTemplate(4),
  STRIP_TOP,
];

/**
 * Les plantilles pròpiament dites, les que no són «X columnes» o «Y files»:
 * el selector «Plantilla» de la pàgina en blocs, en l'ordre de l'estudi (de més
 * a menys esmentades). La graella 2 × 2 i la tira a dalt (`grid-2x2`,
 * `strip-top`) ja no s'hi ofereixen, però les pàgines que les porten les
 * continuen tenint (`templateById`).
 */
export const SHAPED_TEMPLATES: readonly LayoutTemplate[] = [
  AGENDA_STRIP,
  TODAY_AGENDA,
  FIRST_THEN,
  WEEK,
  TOKEN_BOARD,
  STORY_PAGE,
  MENU,
];

/**
 * Si els blocs de la pàgina caben a la plantilla. Amb espais de rètol, les
 * seqüències només van als espais de seqüència; els rètols van als seus i, si
 * en sobren, als de seqüència que quedin.
 */
export const templateFits = (
  template: LayoutTemplate,
  placements: readonly PagePlacement[],
): boolean => {
  const boxed = placements.filter(isBoxed);
  if (boxed.length > template.slots.length) return false;
  if (!hasTextSlots(template)) return true;
  const sequences = boxed.filter(({ kind }) => kind === "sequence").length;
  const sequenceSlots = template.slots.filter(
    (slot) => slotKind(slot) === "sequence",
  ).length;
  return sequences <= sequenceSlots;
};

/**
 * De les plantilles on caben els blocs, la que s'hi ajusta més: la que té
 * menys espais de seqüència (i, si n'hi ha més d'una, la primera). És la que
 * pren una pàgina en passar a «Amb una plantilla», perquè no n'estreni més
 * espais buits ni més rètols dels que calen.
 */
export const closestTemplate = (
  fitting: readonly LayoutTemplate[],
): LayoutTemplate | undefined => {
  const sequenceSlots = (template: LayoutTemplate) =>
    template.slots.filter((slot) => slotKind(slot) === "sequence").length;
  return fitting.reduce<LayoutTemplate | undefined>(
    (best, template) =>
      !best || sequenceSlots(template) < sequenceSlots(best) ? template : best,
    undefined,
  );
};

/** La plantilla amb més espais de seqüència (la primera, si n'hi ha més d'una). */
export const largestTemplate = (
  templates: readonly LayoutTemplate[],
): LayoutTemplate | undefined => {
  const sequenceSlots = (template: LayoutTemplate) =>
    template.slots.filter((slot) => slotKind(slot) === "sequence").length;
  return templates.reduce<LayoutTemplate | undefined>(
    (best, template) =>
      !best || sequenceSlots(template) > sequenceSlots(best) ? template : best,
    undefined,
  );
};

/** Les plantilles del selector on caben `count` caixes. */
export const templatesFor = (count: number): LayoutTemplate[] =>
  TEMPLATE_CHOICES.filter(({ slots }) => slots.length >= count);

/**
 * La plantilla que toca per a `count` caixes, sense triar-ne cap: la que fa
 * servir passar una pàgina a blocs i afegir-hi una seqüència quan no hi cap.
 * Totes en el sentit de la pàgina contínua, com hi eren: amb les seqüències en
 * files, **`count` files**; en columnes, **`count` columnes**. Així, en passar
 * a blocs, cada seqüència queda on era, i els pictogrames de dins segueixen
 * el mateix sentit (`resolveColumns`).
 */
export const templateFor = (
  count: number,
  direction: SequenceDirection,
): LayoutTemplate =>
  stackTemplate(Math.max(1, count), direction === "row" ? "rows" : "columns");

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
 * L'espai de cada bloc, en l'ordre de `ordered`. Sense espais de rètol, un
 * darrere l'altre. Amb, les seqüències van als espais de seqüència i els
 * rètols als seus; els rètols que no hi caben, als de seqüència que quedin.
 * Els que no hi caben no en reben cap.
 */
const slotIndexes = (
  ordered: readonly { id: string; kind?: string }[],
  template: LayoutTemplate,
): Map<string, number> => {
  if (!hasTextSlots(template))
    return new Map(
      ordered
        .slice(0, template.slots.length)
        .map((placement, index) => [placement.id, index]),
    );
  const free: Record<SlotKind, number[]> = { sequence: [], text: [] };
  template.slots.forEach((slot, index) => free[slotKind(slot)].push(index));
  const result = new Map<string, number>();
  const take = (id: string, kind: SlotKind) => {
    const index = free[kind].shift();
    if (index !== undefined) result.set(id, index);
    return index !== undefined;
  };
  ordered
    .filter(({ kind }) => kind !== "text")
    .forEach(({ id }) => take(id, "sequence"));
  ordered
    .filter(({ kind }) => kind === "text")
    .forEach(({ id }) => take(id, "text") || take(id, "sequence"));
  return result;
};

/**
 * Els blocs que no caben a la plantilla, en ordre de lectura: els que
 * aplicar-la trauria de la pàgina. Buit si hi caben tots.
 */
export const overflowOf = (
  template: LayoutTemplate,
  placements: readonly PagePlacement[],
): string[] => {
  const ordered = sortByReadingOrder(placements.filter(isBoxed));
  const placed = slotIndexes(ordered, template);
  return ordered.flatMap(({ id }) => (placed.has(id) ? [] : [id]));
};

/**
 * La caixa de cada bloc, espai per espai en l'ordre de `ordered` (vegeu
 * `slotIndexes`). Els que no hi caben no en reben cap.
 */
export const assignSlots = (
  ordered: readonly { id: string; kind?: string }[],
  template: LayoutTemplate,
  region: Box,
): Map<string, SlotBox> =>
  new Map(
    Array.from(slotIndexes(ordered, template)).map(([id, index]) => [
      id,
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
export const templateById = (
  id: string,
  count = 0,
): LayoutTemplate | undefined => {
  const stack = /^(rows|columns)-([1-9][0-9]?)$/.exec(id);
  // «X columnes» i «Y files» creixen amb els blocs (`arrangementTemplate`)
  if (stack)
    return arrangementTemplate(
      stack[1] as "rows" | "columns",
      Number(stack[2]),
      count,
    );
  const choice = [...TEMPLATE_CHOICES, ...SHAPED_TEMPLATES, FREE_TEMPLATE].find(
    (template) => template.id === id,
  );
  if (choice) return choice;
  const grid = /^grid-([1-9])x([1-9])$/.exec(id);
  if (grid) return fixedGrid(Number(grid[1]), Number(grid[2]));
  return undefined;
};

/**
 * Els espais de la plantilla que cap bloc no ocupa, en ordre. Amb `kind`,
 * només els d'aquell tipus.
 */
export const freeSlots = (
  template: LayoutTemplate,
  placements: readonly PagePlacement[],
  kind?: SlotKind,
): number[] => {
  const taken = new Set(
    placements.flatMap((placement) =>
      isBoxed(placement) && placement.slot !== undefined
        ? [placement.slot]
        : [],
    ),
  );
  return template.slots.flatMap((slot, index) =>
    taken.has(index) || (kind && slotKind(slot) !== kind) ? [] : [index],
  );
};
