/**
 * Conversió entre mil·límetres i píxels per a la pàgina impresa.
 *
 * El DPI és un **argument obligatori** a propòsit. Abans aquestes dues
 * funcions queien a un DPI «detectat» de la pantalla quan no se'ls passava
 * cap, i qui escrivia `mmToPixels(210)` sortia del contracte de la casa sense
 * cap avís: la previsualització i el paper han de coincidir, i el navegador
 * imprimeix sempre a `CSS_PRINT_DPI`, el monitor que sigui.
 */

/** Mil·límetres en una polzada. */
const MM_PER_INCH = 25.4;

/** Mil·límetres a píxels, arrodonit al píxel. */
export const mmToPixels = (mm: number, dpi: number): number =>
  Math.round((mm * dpi) / MM_PER_INCH);

/** Píxels a mil·límetres. */
export const pixelsToMM = (pixels: number, dpi: number): number =>
  (pixels * MM_PER_INCH) / dpi;
