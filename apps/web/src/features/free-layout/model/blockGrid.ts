// La graella d'un bloc de seqüència tal com es pinta: la fan servir la caixa
// del full i el nivell «Bloc» de la columna, que ha de dir la mida que en surt
// de debò (Q2, `docs/PLA-mode-lliure.md`).
import type { PlacementColumns, SequenceViewSettings } from "@/types/document";
import { pixelsToMM } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import { CARD_IMAGE_MM, Grid, computeGrid } from "./computeGrid";
import type { Arrangement } from "./templates";

/** Una targeta a mida 1, en píxels d'impressió (la mesura `CardBaseMeasurer`). */
export interface CardPx {
  w: number;
  h: number;
}

/**
 * La targeta a mida 1 abans que el mesurador digui res (o on no pot mesurar,
 * com a les proves): l'amplada de la targeta amb vora i una línia de text.
 */
export const FALLBACK_CARD_PX: CardPx = { w: 182, h: 210 };

/** L'espai entre targetes a mida 1, en px: el `pictSpaceBetween` és en unitats de 8 px, com al flux. */
export const SPACE_UNIT_PX = 8;

export interface BlockGridInput {
  count: number;
  /** La targeta mesurada; sense valor, la de reserva */
  card: CardPx | undefined;
  /** La vista resolta del bloc: la mida hi és el màxim */
  view: SequenceViewSettings;
  /** La caixa, en mm */
  box: { w: number; h: number };
  columns: PlacementColumns;
}

export interface BlockGrid {
  grid: Grid;
  /** L'espai entre targetes a la mida que surt, en px d'impressió */
  gapPx: number;
  /** El costat de la imatge del pictograma a la mida que surt, en mm */
  imageMm: number;
}

/** La graella d'un bloc: la més gran que hi cap, sense passar de la mida del bloc. */
export const blockGrid = ({
  count,
  card,
  view,
  box,
  columns,
}: BlockGridInput): BlockGrid => {
  const measured = card && card.w > 0 ? card : FALLBACK_CARD_PX;
  // L'espai negatiu del flux (fins a -2) aquí no té sentit: la graella el pren a 0
  const space = Math.max(0, view.pictSpaceBetween) * SPACE_UNIT_PX;
  const grid = computeGrid({
    count,
    card: {
      w: pixelsToMM(measured.w, CSS_PRINT_DPI),
      h: pixelsToMM(measured.h, CSS_PRINT_DPI),
    },
    gap: pixelsToMM(space, CSS_PRINT_DPI),
    box,
    columns,
    maxSize: view.sizePict,
  });
  return {
    grid,
    gapPx: space * grid.size,
    imageMm: grid.size * CARD_IMAGE_MM,
  };
};

/**
 * Les columnes de dins d'un bloc. Amb un nombre triat, aquest. En
 * automàtiques, les que demana el repartiment de la pàgina: en una pàgina «en
 * columnes», els blocs són estrets i els pictogrames van **en una columna**;
 * «en files», els blocs són amples i van **en una sola fila**; amb una
 * plantilla, les que fan els pictogrames més grans.
 */
export const resolveColumns = (
  columns: PlacementColumns,
  arrangement: Arrangement["kind"] | undefined,
  count: number,
): PlacementColumns => {
  if (columns !== "auto") return columns;
  if (arrangement === "columns") return 1;
  if (arrangement === "rows") return Math.max(1, count);
  return "auto";
};
