/**
 * Tipus i configuracions per a formats de pàgina
 * Segueix el principi Open/Closed: fàcil afegir nous formats sense modificar codi existent
 */

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
 * DPI estàndard utilitzat pels navegadors web
 * Aquest valor es fa servir per convertir mm → px
 *
 * IMPORTANT: En producció, aquest valor s'actualitza dinàmicament
 * segons la pantalla de cada usuari utilitzant getUserDPI()
 */
export const STANDARD_DPI = 96;

/**
 * Obté el DPI que s'ha d'utilitzar per a l'usuari actual
 * Considera: preferència guardada > DPI detectat > DPI per defecte
 *
 * @returns DPI a utilitzar per càlculs
 */
export function getDPIForUser(): number {
  // Si estem en servidor (SSR), usar valor per defecte
  if (typeof window === "undefined") {
    return STANDARD_DPI;
  }

  try {
    // Intentar carregar utilitats de detecció
    // (es carregaran dinàmicament per evitar dependències circulars)
    const {
      getUserDPI,
    } = require("@/features/print-refactor/components/dpiDetector");
    return getUserDPI();
  } catch (error) {
    // Si no es poden carregar les utilitats, usar devicePixelRatio
    const pixelRatio = window.devicePixelRatio || 1;
    return STANDARD_DPI * pixelRatio;
  }
}

/**
 * Marges d'impressió en mil·límetres (per cada costat)
 * Aquests són els marges típics que els navegadors/impressores apliquen
 * Ajusta aquest valor segons els teus marges d'impressió reals
 */
export const PRINT_MARGIN_MM = 10;

/**
 * Configuració de marges per a diferents mides de pantalla
 */
export const SCREEN_MARGINS: ScreenMargins = {
  small: 65,
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
 * Ajusta si la previsualització no coincideix amb la impressió
 */
export const PRINT_CONTAINER_PADDING = 0;

/**
 * Dimensions de paper estàndard ISO en mil·límetres
 */
export const PAPER_DIMENSIONS_MM = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
};

/**
 * Converteix mil·límetres a píxels segons DPI de l'usuari
 * @param mm - Valor en mil·límetres
 * @param customDPI - DPI personalitzat (opcional, per defecte usa getDPIForUser())
 * @returns Valor en píxels
 */
export function mmToPixels(mm: number, customDPI?: number): number {
  const dpi = customDPI || getDPIForUser();
  return Math.round((mm * dpi) / 25.4);
}

/**
 * Converteix píxels a mil·límetres segons DPI de l'usuari
 * @param pixels - Valor en píxels
 * @param customDPI - DPI personalitzat (opcional, per defecte usa getDPIForUser())
 * @returns Valor en mil·límetres
 */
export function pixelsToMM(pixels: number, customDPI?: number): number {
  const dpi = customDPI || getDPIForUser();
  return (pixels * 25.4) / dpi;
}

/**
 * Calcula les dimensions útils d'un paper descomptant marges
 * @param paperWidthMM - Amplada del paper en mm
 * @param paperHeightMM - Alçada del paper en mm
 * @param marginMM - Marge en mm (aplicat a cada costat)
 * @returns Dimensions útils en píxels
 */
export function calculateUsableDimensions(
  paperWidthMM: number,
  paperHeightMM: number,
  marginMM: number = PRINT_MARGIN_MM,
): PageDimensions {
  const usableWidthMM = paperWidthMM - marginMM * 2;
  const usableHeightMM = paperHeightMM - marginMM * 2;

  return {
    width: mmToPixels(usableWidthMM),
    height: mmToPixels(usableHeightMM),
  };
}

/**
 * Definicions de formats de pàgina amb dimensions útils
 * Les dimensions representen l'espai útil després de descomptar marges d'impressió
 */
export const PAGE_FORMATS: Record<PageSize, PageDimensions> = {
  A4: calculateUsableDimensions(
    PAPER_DIMENSIONS_MM.A4.width,
    PAPER_DIMENSIONS_MM.A4.height,
  ),
  A3: calculateUsableDimensions(
    PAPER_DIMENSIONS_MM.A3.width,
    PAPER_DIMENSIONS_MM.A3.height,
  ),
  FULLSCREEN: {
    width: typeof window !== "undefined" ? window.screen.width : 1920,
    height: typeof window !== "undefined" ? window.screen.height : 1080,
  },
};

/**
 * Factory function per crear configuracions de pàgina
 * Segueix el principi de substitució de Liskov
 */
export function createPageFormat(
  size: PageSize,
  orientation: PageOrientation,
): PageFormat {
  const baseDimensions = PAGE_FORMATS[size];

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
 */
export function isMediumScreen(screenWidth: number): boolean {
  return screenWidth > 900;
}
