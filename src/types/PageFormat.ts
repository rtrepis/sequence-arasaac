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
 * Padding del contenidor en mode print
 */
export const PRINT_CONTAINER_PADDING = 24;

/**
 * Definicions de formats de pàgina estàndard
 * Dimensions en píxels basades en 96 DPI
 */
export const PAGE_FORMATS: Record<PageSize, PageDimensions> = {
  A4: {
    width: 975, // 210mm @ 96dpi ≈ 794px, però ajustat per marges
    height: 689, // 297mm @ 96dpi ≈ 1123px, però ajustat per marges
  },
  A3: {
    width: 1450, // 297mm @ 96dpi
    height: 1025, // 420mm @ 96dpi
  },
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
    orientation === "portrait"
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
