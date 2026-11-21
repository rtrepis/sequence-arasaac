// Recol·locar els blocs quan el full canvia de mida o de forma: en passar a la
// pantalla sencera (o tornar-ne al paper) i en adaptar-la a una altra pantalla
// (`docs/PLA-mode-lliure.md`, §13, «La pantalla sencera amb blocs»). Funcions
// pures, en mil·límetres.
import type { DocumentPages, PagePlacement } from "@/types/document";
import { SheetArea, clampBox, hasBox, isBoxed } from "./placement";
import { freeRegion, slotToBox, templateById } from "./templates";

/** Si dues àrees són la mateixa (a una centèsima de mil·límetre). */
export const sameArea = (a: SheetArea, b: SheetArea): boolean =>
  Math.abs(a.w - b.w) < 0.01 && Math.abs(a.h - b.h) < 0.01;

/**
 * Les pàgines amb els blocs recol·locats al full nou. Els que ocupen un espai
 * de la plantilla de la seva pàgina (`slot`) es tornen a calcular amb aquell
 * espai, que és una fracció del full: queden com si la plantilla s'hagués
 * aplicat al full nou. Els moguts a mà (i els comuns) s'escalen en proporció,
 * en amplada i en alçada. Els d'una pàgina automàtica no tenen caixa i no es
 * toquen, ni els que l'app no entén.
 */
export const rescalePages = (
  pages: DocumentPages,
  from: SheetArea,
  to: SheetArea,
): DocumentPages => {
  if (sameArea(from, to)) return pages;
  const fx = to.w / from.w;
  const fy = to.h / from.h;

  const scale = <T extends PagePlacement>(placement: T): T =>
    isBoxed(placement) && hasBox(placement)
      ? clampBox(
          {
            ...placement,
            x: placement.x * fx,
            y: placement.y * fy,
            w: placement.w * fx,
            h: placement.h * fy,
          },
          to,
        )
      : placement;

  const common = pages.common.map(scale);
  // L'espai de les plantilles és el que deixen lliure els comuns, ja al full nou
  const region = freeRegion(to, common.filter(isBoxed));

  const sheets = pages.sheets.map((sheet) => {
    const template = sheet.template
      ? templateById(sheet.template, sheet.placements.filter(isBoxed).length)
      : undefined;
    return {
      ...sheet,
      placements: sheet.placements.map((placement) => {
        const slot =
          isBoxed(placement) &&
          hasBox(placement) &&
          placement.slot !== undefined
            ? template?.slots[placement.slot]
            : undefined;
        return slot
          ? { ...placement, ...slotToBox(slot, region) }
          : scale(placement);
      }),
    };
  });

  return { ...pages, common, sheets };
};
