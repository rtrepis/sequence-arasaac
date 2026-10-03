/**
 * Tipus i configuracions dels formats de pàgina.
 *
 * Les mides surten del paper (ISO 216, en mil·límetres) i es converteixen amb
 * `CSS_PRINT_DPI`: el navegador imprimeix sempre a 96 DPI CSS, de manera que
 * la previsualització coincideix amb el full en qualsevol monitor. Aquest
 * fitxer feia abans un camí més llarg —demanava el DPI «de la pantalla» a un
 * detector que, per força, sempre retornava 96, perquè una polzada CSS val 96
 * píxels per definició.
 */

import type { PageSize } from "@sequence-arasaac/shared-types";
import { mmToPixels } from "./pageUnits";

// La mida de pàgina viatja dins del document i de l'API: la declara
// `shared-types` i aquí només es reexporta, perquè no n'hi hagi dues versions
// que puguin divergir
export type { PageSize };

export type PageOrientation = "landscape" | "portrait";

export interface PageDimensions {
  width: number;
  height: number;
}

export interface PageFormat {
  size: PageSize;
  orientation: PageOrientation;
  dimensions: PageDimensions;
}

export interface ScreenMargins {
  small: number; // xs/sm screens
  medium: number; // md+ screens
}

/**
 * Marges d'impressió en mil·límetres (per cada costat)
 * Aquests són els marges típics que els navegadors/impressores apliquen
 *
 */
export const PRINT_MARGIN_MM = 10;

/**
 * Configuració de marges per a diferents mides de pantalla
 */
export const SCREEN_MARGINS: ScreenMargins = {
  small: 48,
  medium: 380,
};

/**
 * Espai reservat per al footer (copyright, etc.)
 */
export const FOOTER_SPACE = 150;

/**
 * Escala per defecte en mode fullscreen
 */
export const FULLSCREEN_SCALE = 0.82;

/**
 * Dimensions de paper estàndard ISO en mil·límetres
 * Font: https://en.wikipedia.org/wiki/ISO_216
 */
export const PAPER_DIMENSIONS_MM = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
} as const;

/**
 * DPI estàndard CSS — el navegador sempre imprimeix amb aquest valor,
 * independentment del DPI físic de la pantalla o del monitor connectat.
 */
export const CSS_PRINT_DPI = 96;

/**
 * Calcula les dimensions útils d'un paper descomptant marges.
 * Sempre a `CSS_PRINT_DPI`, perquè el preview coincideixi amb la impressió en
 * qualsevol monitor o `devicePixelRatio`.
 *
 * @param paperWidthMM - Amplada del paper en mm
 * @param paperHeightMM - Alçada del paper en mm
 * @param marginMM - Marge en mm (aplicat a cada costat)
 * @returns Dimensions útils en píxels a 96 DPI
 */
export function calculateUsableDimensions(
  paperWidthMM: number,
  paperHeightMM: number,
  marginMM: number = PRINT_MARGIN_MM,
): PageDimensions {
  const usableWidthMM = paperWidthMM - marginMM * 2;
  const usableHeightMM = paperHeightMM - marginMM * 2;

  return {
    width: mmToPixels(usableWidthMM, CSS_PRINT_DPI),
    height: mmToPixels(usableHeightMM, CSS_PRINT_DPI),
  };
}

/**
 * Crea la configuració d'una pàgina.
 *
 * @param size - Mida de pàgina (A4, A3, FULLSCREEN)
 * @param orientation - Orientació (landscape, portrait)
 * @returns El format, amb les dimensions útils en píxels d'impressió
 */
export function createPageFormat(
  size: PageSize,
  orientation: PageOrientation,
): PageFormat {
  let baseDimensions: PageDimensions;

  if (size === "FULLSCREEN") {
    const screenW = window.screen.width;
    const screenH = window.screen.height;
    // Les dimensions de pantalla ja reflecteixen l'orientació física
    // Usem max/min per garantir landscape=horitzontal, portrait=vertical
    const maxDim = Math.max(screenW, screenH);
    const minDim = Math.min(screenW, screenH);
    const dimensions: PageDimensions =
      orientation === "landscape"
        ? { width: maxDim, height: minDim }
        : { width: minDim, height: maxDim };
    return { size, orientation, dimensions };
  } else {
    // Les mides del paper, menys els marges, en píxels d'impressió
    const paperDimensions = PAPER_DIMENSIONS_MM[size];
    baseDimensions = calculateUsableDimensions(
      paperDimensions.width,
      paperDimensions.height,
    );
  }

  // Aplicar orientació
  const dimensions: PageDimensions =
    orientation === "landscape"
      ? { width: baseDimensions.height, height: baseDimensions.width }
      : baseDimensions;

  return {
    size,
    orientation,
    dimensions,
  };
}

/**
 * Utilitat per verificar si una mida de pantalla és medium o més gran
 *
 * @param screenWidth - Amplada de la pantalla en píxels
 * @returns true si és una pantalla medium (>900px)
 */
export function isMediumScreen(screenWidth: number): boolean {
  return screenWidth > 900;
}

