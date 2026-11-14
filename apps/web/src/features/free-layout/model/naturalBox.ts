// La mida justa d'un bloc de seqüència: la que fan els seus pictogrames a la
// mida i l'espai de la seva distribució. És la mida de les caixes en passar
// una pàgina a «Lliure», i la que pren un bloc lliure quan la seqüència li
// creix per sobre (pas 7c, `docs/decisions/ADR-005-disposicio-lliure.md`).
import type {
  DocumentPages,
  PlacementColumns,
  SequencePlacement,
  SequenceViewSettings,
} from "@/types/document";
import { pixelsToMM } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import { CardPx, FALLBACK_CARD_PX, SPACE_UNIT_PX } from "./blockGrid";
import type { SheetArea } from "./placement";
import { mapSheet } from "./sheets";
import { sortByReadingOrder } from "./readingOrder";

/** Un marge perquè la graella hi càpiga sencera malgrat els arrodoniments, en mm. */
const FIT_MARGIN_MM = 0.5;

export interface NaturalBoxInput {
  /** Quants pictogrames té la seqüència (sense cap, la mida d'un) */
  count: number;
  /** La targeta mesurada a mida 1; sense valor, la de reserva */
  card: CardPx | undefined;
  /** La distribució resolta del bloc */
  view: SequenceViewSettings;
  /** Les columnes de dins del bloc */
  columns: PlacementColumns;
  /** L'àrea útil del full: la caixa no en pot sortir */
  area: SheetArea;
}

/**
 * La caixa justa d'un bloc, en mm. Amb columnes automàtiques, els pictogrames
 * en una sola fila, i en més (repartits a parts iguals) si no caben en
 * l'amplada del full; amb un nombre de columnes, aquest. Mai més gran que
 * l'àrea útil.
 */
export const naturalBoxMm = ({
  count,
  card,
  view,
  columns,
  area,
}: NaturalBoxInput): { w: number; h: number } => {
  const measured = card && card.w > 0 ? card : FALLBACK_CARD_PX;
  const size = view.sizePict;
  const cardW = pixelsToMM(measured.w, CSS_PRINT_DPI) * size;
  const cardH = pixelsToMM(measured.h, CSS_PRINT_DPI) * size;
  const gap =
    pixelsToMM(
      Math.max(0, view.pictSpaceBetween) * SPACE_UNIT_PX,
      CSS_PRINT_DPI,
    ) * size;
  const n = Math.max(1, count);
  const perRow =
    columns === "auto"
      ? Math.max(1, Math.floor((area.w + gap) / (cardW + gap)))
      : Math.max(1, Math.floor(columns));
  // Les files que calen, i tan poques columnes com es pugui per omplir-les:
  // sis en dues files són tres i tres, no cinc i un
  const rows = Math.ceil(n / Math.min(n, perRow));
  const cols = columns === "auto" ? Math.ceil(n / rows) : Math.min(n, perRow);
  return {
    w: Math.min(area.w, cols * cardW + (cols - 1) * gap + FIT_MARGIN_MM),
    h: Math.min(area.h, rows * cardH + (rows - 1) * gap + FIT_MARGIN_MM),
  };
};

/** La caixa justa de cada bloc de seqüència. */
export type NaturalBoxOf = (placement: SequencePlacement) => {
  w: number;
  h: number;
};

/** Una caixa dins de l'àrea útil: si en surt, es tira enrere. */
const keepInside = <T extends { x: number; y: number; w: number; h: number }>(
  box: T,
  area: SheetArea,
): T => ({
  ...box,
  x: Math.max(0, Math.min(box.x, area.w - box.w)),
  y: Math.max(0, Math.min(box.y, area.h - box.h)),
});

type Rect = { x: number; y: number; w: number; h: number };

/** Dues caixes es trepitgen (tocar-se no compta). */
const overlap = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w - 0.01 &&
  b.x < a.x + a.w - 0.01 &&
  a.y < b.y + b.h - 0.01 &&
  b.y < a.y + a.h - 0.01;

/** De la mida justa cap avall, les escales que es proven si no hi cap. */
const SHRINK_STEPS = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

/**
 * On va una caixa sense trepitjar les ja posades: al seu lloc si hi cap, i si
 * no, al primer lloc lliure en ordre de lectura (a dalt de tot, o a la dreta o
 * a sota d'una altra). Si a la mida justa no hi cap enlloc, es fa més petita
 * (els pictogrames s'hi adapten, com en una caixa que l'usuari ha fet petita).
 * Si ni així, es queda al seu lloc.
 */
const placeWithoutOverlap = <T extends Rect>(
  box: T,
  placed: readonly Rect[],
  area: SheetArea,
): T => {
  const inside = (candidate: Rect) =>
    candidate.x >= 0 &&
    candidate.y >= 0 &&
    candidate.x + candidate.w <= area.w + 0.01 &&
    candidate.y + candidate.h <= area.h + 0.01;
  const free = (candidate: Rect) =>
    inside(candidate) && placed.every((other) => !overlap(candidate, other));
  const own = keepInside(box, area);
  const spots = [
    { x: own.x, y: own.y },
    { x: 0, y: 0 },
    ...placed.flatMap((other) => [
      { x: other.x + other.w, y: other.y },
      { x: 0, y: other.y + other.h },
      { x: other.x, y: other.y + other.h },
    ]),
  ];
  const inReadingOrder = [
    spots[0],
    ...spots.slice(1).sort((a, b) => a.y - b.y || a.x - b.x),
  ];
  for (const scale of SHRINK_STEPS) {
    const size = { w: box.w * scale, h: box.h * scale };
    const spot = inReadingOrder.find((candidate) =>
      free({ ...candidate, ...size }),
    );
    if (spot) return { ...box, ...spot, ...size };
  }
  return own;
};

/**
 * Passar a «Lliure» (pas 7c): cada bloc de seqüència de la pàgina pren la mida
 * justa dels seus pictogrames. Es queda al seu lloc si hi cap sense trepitjar
 * cap altre bloc; si no, va al primer lloc lliure en ordre de lectura, i si no
 * n'hi ha cap, es fa més petit fins que hi càpiga. Els rètols no canvien, i
 * els altres blocs no s'hi posen a sobre.
 */
export const fitSheetBlocks = (
  pages: DocumentPages,
  sheetIndex: number,
  naturalOf: NaturalBoxOf,
  area: SheetArea,
): DocumentPages =>
  mapSheet(pages, sheetIndex, (sheet) => {
    // Els rètols ja tenen lloc; els blocs de seqüència, en ordre de lectura
    const placed: Rect[] = sheet.placements.flatMap((placement) =>
      placement.kind === "text" ? [placement] : [],
    );
    const order = sortByReadingOrder(
      sheet.placements.flatMap((placement) =>
        placement.kind === "sequence" ? [placement] : [],
      ),
    );
    const fitted = new Map<string, SequencePlacement>();
    order.forEach((placement) => {
      const box = placeWithoutOverlap(
        { ...placement, ...naturalOf(placement) },
        placed,
        area,
      );
      placed.push(box);
      fitted.set(placement.id, box);
    });
    return {
      ...sheet,
      placements: sheet.placements.map((placement) =>
        placement.kind === "sequence"
          ? (fitted.get(placement.id) ?? placement)
          : placement,
      ),
    };
  });

/** El que ha de créixer un bloc: la caixa nova, o `undefined` si no cal. */
export const grownBox = <
  T extends { x: number; y: number; w: number; h: number },
>(
  box: T,
  before: { w: number; h: number },
  after: { w: number; h: number },
  area: SheetArea,
): T | undefined => {
  // Només creix pel costat on la seqüència ha crescut i ja no hi cap
  const w =
    after.w > before.w + FIT_MARGIN_MM && after.w > box.w ? after.w : box.w;
  const h =
    after.h > before.h + FIT_MARGIN_MM && after.h > box.h ? after.h : box.h;
  if (w === box.w && h === box.h) return undefined;
  return keepInside({ ...box, w, h }, area);
};
