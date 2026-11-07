// La graella de pictogrames d'una caixa: quantes columnes i a quina mida.
//
// En una plantilla **mana la caixa**, però la mida de l'estil és un màxim (Q2,
// ADR-005 decisió 9): la mida és la més gran que hi cap, sense passar-ne. Com que la targeta és proporcional a la seva mida
// (amplada, vores, lletra i imatge es multipliquen totes per `sizePict`, a
// `PictogramCard.styled.ts`), n'hi ha prou de saber què fa la targeta a mida 1:
// la resta és una regla de tres. Vegeu `docs/PLA-mode-lliure.md`, §7.
import type { PlacementColumns } from "@/types/document";
import { pixelsToMM } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import { MIN_PICTO_MM, SheetArea } from "./placement";

/**
 * Costat de la imatge de la targeta a mida 1, en píxels d'impressió. És el 150
 * de `PictogramCard.tsx`; si allà canvia, aquí també.
 */
export const CARD_IMAGE_PX = 150;

/** Costat de la imatge a mida 1, en mm. */
export const CARD_IMAGE_MM = pixelsToMM(CARD_IMAGE_PX, CSS_PRINT_DPI);

/** La mida (`sizePict`) que dona una imatge de `MIN_PICTO_MM` de costat. */
export const MIN_GRID_SIZE = MIN_PICTO_MM / CARD_IMAGE_MM;

/** Diferència de mida que es considera un empat. */
const SIZE_EPSILON = 1e-9;

export interface GridInput {
  /** Quants pictogrames té la seqüència */
  count: number;
  /** La targeta més gran de la seqüència a mida 1, en mm */
  card: { w: number; h: number };
  /** L'espai entre targetes a mida 1, en mm: creix i s'encongeix amb elles */
  gap: number;
  /** La caixa, en mm */
  box: SheetArea;
  /** Les columnes que demana la caixa */
  columns: PlacementColumns;
  /** La mida més petita que es deixa pintar. Per defecte, la de `MIN_PICTO_MM` */
  minSize?: number;
  /** La mida més gran que es deixa pintar (la del bloc, Q2). Sense valor, cap */
  maxSize?: number;
}

export interface Grid {
  columns: number;
  rows: number;
  /** La mida de les targetes (`sizePict`): la més gran que hi cap, fins al màxim */
  size: number;
  /** Amplada i alçada de la graella a aquesta mida, en mm */
  w: number;
  h: number;
  /** La mida que hi cap és més petita que la mínima: la caixa és massa petita */
  belowMinimum: boolean;
}

/** Amplada i alçada d'una graella a mida 1. */
const gridAtSizeOne = (
  columns: number,
  rows: number,
  { card, gap }: Pick<GridInput, "card" | "gap">,
): { w: number; h: number } => ({
  w: columns * card.w + (columns - 1) * gap,
  h: rows * card.h + (rows - 1) * gap,
});

/**
 * La graella que fa les targetes més grans dins de la caixa.
 *
 * Prova cada nombre de columnes de 1 a `count` (o només el que demana la
 * caixa), amb les files que calen, i es queda amb el que dona la mida més
 * gran. Si dos empaten, el que fa menys files: es llegeix millor en horitzontal.
 * Mai més columnes que pictogrames, ni amb un nombre fix.
 */
export const computeGrid = (input: GridInput): Grid => {
  const { count, box, columns } = input;
  const minSize = input.minSize ?? MIN_GRID_SIZE;
  if (count <= 0)
    return { columns: 0, rows: 0, size: 0, w: 0, h: 0, belowMinimum: false };

  const candidates =
    columns === "auto"
      ? Array.from({ length: count }, (_, index) => index + 1)
      : [Math.min(Math.max(1, Math.floor(columns)), count)];

  const grids = candidates.map((cols): Grid => {
    const rows = Math.ceil(count / cols);
    const one = gridAtSizeOne(cols, rows, input);
    const fits = Math.min(box.w / one.w, box.h / one.h);
    const size =
      input.maxSize === undefined ? fits : Math.min(fits, input.maxSize);
    return {
      columns: cols,
      rows,
      size,
      w: one.w * size,
      h: one.h * size,
      // Només avisa si és la caixa la que no deixa arribar al mínim
      belowMinimum: fits < minSize,
    };
  });
  return grids.reduce((best, grid) =>
    grid.size > best.size + SIZE_EPSILON ||
    (Math.abs(grid.size - best.size) <= SIZE_EPSILON && grid.rows < best.rows)
      ? grid
      : best,
  );
};
