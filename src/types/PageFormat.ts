/**
 * Tipus i configuracions per a formats de pàgina
 * Actualitzat per usar dpiManager com a font única de veritat per DPI
 *
 * Segueix el principi Open/Closed: fàcil afegir nous formats sense modificar codi existent
 */

import {
  getCurrentDPI,
  mmToPixels as mmToPx,
  pixelsToMM as pxToMM,
} from "@/features/print-refactor/utils/dpiManager";

export type PageSize = "A4" | "A3" | "FULLSCREEN";
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
 * Re-exportar funcions de conversió del dpiManager per compatibilitat
 * @deprecated Usar directament des de @/utils/dpiManager
 */
export const mmToPixels = mmToPx;
export const pixelsToMM = pxToMM;
export const getDPIForUser = getCurrentDPI;

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
 * Padding del contenidor d'impressió
 * Aquest valor s'utilitza per calcular l'escala de previsualització
 *
 */
export const PRINT_CONTAINER_PADDING = 0;

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
 * Calcula les dimensions útils d'un paper descomptant marges
 * Usa el DPI actual del sistema per la conversió mm → px
 *
 * IMPORTANT: Aquesta funció ara es crida dinàmicament, no en temps de càrrega
 *
 * @param paperWidthMM - Amplada del paper en mm
 * @param paperHeightMM - Alçada del paper en mm
 * @param marginMM - Marge en mm (aplicat a cada costat)
 * @returns Dimensions útils en píxels segons DPI actual
 */
export function calculateUsableDimensions(
  paperWidthMM: number,
  paperHeightMM: number,
  marginMM: number = PRINT_MARGIN_MM,
): PageDimensions {
  const usableWidthMM = paperWidthMM - marginMM * 2;
  const usableHeightMM = paperHeightMM - marginMM * 2;

  // Usar mmToPx del dpiManager que usa getCurrentDPI()
  return {
    width: mmToPx(usableWidthMM),
    height: mmToPx(usableHeightMM),
  };
}

/**
 * Factory function per crear configuracions de pàgina
 * Calcula dimensions dinàmicament segons el DPI actual
 *
 * Segueix el principi de substitució de Liskov
 *
 * @param size - Mida de pàgina (A4, A3, FULLSCREEN)
 * @param orientation - Orientació (landscape, portrait)
 * @returns PageFormat amb dimensions calculades segons DPI actual
 */
export function createPageFormat(
  size: PageSize,
  orientation: PageOrientation,
): PageFormat {
  let baseDimensions: PageDimensions;

  if (size === "FULLSCREEN") {
    baseDimensions = {
      width: typeof window !== "undefined" ? window.screen.width : 1920,
      height: typeof window !== "undefined" ? window.screen.height : 1080,
    };
  } else {
    // Calcular dimensions amb DPI actual
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

