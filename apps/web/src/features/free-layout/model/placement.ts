// Una caixa del mode lliure i el full on viu. Funcions pures, en mil·límetres:
// cap píxel ni cap component. Vegeu `docs/decisions/ADR-005-disposicio-lliure.md`.
import type { PageOrientation, PageSize } from "@/types/ui";
import type { SequencePlacement } from "@/types/document";
import {
  PAPER_DIMENSIONS_MM,
  PRINT_MARGIN_MM,
} from "@features/print/utils/pageFormat";

/** Pas de les fletxes del teclat. */
export const MOVE_STEP_MM = 1;
/** Pas de les fletxes amb Maj. */
export const MOVE_STEP_LARGE_MM = 10;

/**
 * La imatge del pictograma més petita que es deixa pintar, de costat. Per sota
 * d'aquí, una caixa ja no es pot encongir més.
 */
export const MIN_PICTO_MM = 15;

/** El costat més petit d'una caixa, tingui els pictogrames que tingui. */
export const MIN_BOX_MM = 10;

/**
 * Franja del peu de llicència, que les caixes no poden trepitjar. Es reserva
 * sempre, també quan el peu no es pinta: així la posició d'una caixa no depèn
 * d'una preferència de qui obre el document. El peu fa una línia o dues de
 * lletra de 10 px, amb el seu aire (`CopyRight`): uns 8–12 mm.
 */
export const SHEET_FOOTER_RESERVE_MM = 12;

/** L'espai on poden anar les caixes, en mm. L'origen és el cantó superior esquerre del full. */
export interface SheetArea {
  w: number;
  h: number;
}

/** Un rectangle en mm: la part d'una col·locació que diu on és. */
export type Box = Pick<SequencePlacement, "x" | "y" | "w" | "h">;

/**
 * L'àrea útil d'un full: el paper menys el marge d'impressió (el mateix
 * `.preview-content` de la vista) i menys la franja del peu. La pantalla
 * completa no en té: no té mil·límetres, i no admet el mode lliure.
 */
export const sheetAreaMm = (
  size: PageSize,
  orientation: PageOrientation,
): SheetArea | null => {
  if (size === "FULLSCREEN") return null;
  const paper = PAPER_DIMENSIONS_MM[size];
  const [paperW, paperH] =
    orientation === "landscape"
      ? [paper.height, paper.width]
      : [paper.width, paper.height];
  return {
    w: paperW - PRINT_MARGIN_MM * 2,
    h: paperH - PRINT_MARGIN_MM * 2 - SHEET_FOOTER_RESERVE_MM,
  };
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * La caixa dins del full: ni més gran que l'àrea ni més petita que el mínim, i
 * sense sortir-ne per cap costat. Una caixa que sobresurt es mou cap a dins
 * abans d'encongir-se, perquè no perdi la mida que tenia.
 */
export const clampBox = <T extends Box>(box: T, area: SheetArea): T => {
  const w = clamp(box.w, Math.min(MIN_BOX_MM, area.w), area.w);
  const h = clamp(box.h, Math.min(MIN_BOX_MM, area.h), area.h);
  return {
    ...box,
    w,
    h,
    x: clamp(box.x, 0, area.w - w),
    y: clamp(box.y, 0, area.h - h),
  };
};

/** Mou la caixa, sense deixar-la sortir del full. */
export const moveBox = <T extends Box>(
  box: T,
  dx: number,
  dy: number,
  area: SheetArea,
): T => clampBox({ ...box, x: box.x + dx, y: box.y + dy }, area);

/**
 * Canvia la mida de la caixa des del cantó inferior dret (el de les fletxes del
 * teclat i del panell), sense deixar-la sortir del full ni passar del mínim.
 * El cantó superior esquerre no es mou.
 */
export const resizeBox = <T extends Box>(
  box: T,
  dw: number,
  dh: number,
  area: SheetArea,
): T => {
  const w = clamp(box.w + dw, Math.min(MIN_BOX_MM, area.w), area.w - box.x);
  const h = clamp(box.h + dh, Math.min(MIN_BOX_MM, area.h), area.h - box.y);
  return { ...box, w, h };
};

/** Si dues caixes es trepitgen. */
export const boxesOverlap = (a: Box, b: Box): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
