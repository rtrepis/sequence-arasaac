import { useMemo } from "react";
import {
  PageFormat,
  SCREEN_MARGINS,
  FOOTER_SPACE,
  isMediumScreen,
  PageDimensions,
} from "../utils/pageFormat";

/**
 * Com s'encabeix el full a la pantalla:
 * - `"page"`: sencer, sense desplaçar-se. És el per defecte.
 * - `"width"`: a l'amplada que hi ha, i la resta amb desplaçament vertical. Un
 *   full vertical en un escriptori el limita l'alçada, i així es pot veure a
 *   mida real.
 */
export type PreviewFit = "page" | "width";

/**
 * Paràmetres per al càlcul d'escala
 */
export interface ScaleCalculationParams {
  pageFormat: PageFormat;
  screenWidth: number;
  screenHeight: number;
  /** Com s'encabeix el full. Per defecte, sencer */
  fit?: PreviewFit;
  /**
   * Si la columna d'ajustos ocupa el costat del full. Només compta a partir de
   * `isMediumScreen`: per sota, la columna va sota el full i no li pren
   * amplada. Per defecte, sí.
   */
  settingsBeside?: boolean;
}

/**
 * Resultat del càlcul d'escala
 */
export interface ScaleResult {
  displayWidth: number;
  displayHeight: number;
  scale: number;
}

/**
 * Calcula les dimensions de visualització basant-se en el format de pàgina i la pantalla
 * Funció pura - fàcil de testejar
 *
 * @param params - Paràmetres per al càlcul
 * @returns Dimensions i escala calculades
 */
export function calculateDisplayDimensions(
  params: ScaleCalculationParams,
): ScaleResult {
  const {
    pageFormat,
    screenWidth,
    screenHeight,
    fit = "page",
    settingsBeside = true,
  } = params;
  const { dimensions } = pageFormat;

  // El marge és el de la columna d'ajustos quan és al costat del full; sense
  // columna, o amb la columna a sota, el del mòbil
  const margin =
    isMediumScreen(screenWidth) && settingsBeside
      ? SCREEN_MARGINS.medium
      : SCREEN_MARGINS.small;

  // Calcular amplada disponible
  // IMPORTANT: Les dimensions ja venen girades des de createPageFormat
  // En portrait: dimensions.width és l'altura i dimensions.height és l'amplada
  let availableWidth: number;
  let availableHeight: number;

  // Sempre utilitzem les dimensions directament perquè createPageFormat ja les ha girat
  availableWidth = screenWidth - margin;
  availableHeight = (dimensions.height * availableWidth) / dimensions.width;

  // Ajustar si l'alçada supera l'espai disponible. A l'amplada no cal: la
  // resta del full es veu baixant
  if (fit === "page" && availableHeight + FOOTER_SPACE > screenHeight) {
    availableHeight = screenHeight - FOOTER_SPACE;
    availableWidth = (dimensions.width * availableHeight) / dimensions.height;
  }

  // Limitar l'escala a 1.0 màxim: el preview mai pot ser més gran que la impressió real
  const scale = Math.min(1, availableWidth / dimensions.width);
  const displayWidth = scale * dimensions.width;
  const displayHeight = scale * dimensions.height;

  return {
    displayWidth,
    displayHeight,
    scale,
  };
}

/**
 * Obté les dimensions d'impressió basades en el format i orientació
 * Les dimensions ja vénen correctament orientades de createPageFormat
 *
 * @param pageFormat - Format de pàgina
 * @returns Dimensions per a impressió
 */
export function getPrintDimensions(pageFormat: PageFormat): PageDimensions {
  // Les dimensions ja estan correctament orientades per createPageFormat
  return pageFormat.dimensions;
}

/**
 * Hook custom per gestionar els càlculs d'escala
 * Segueix el principi de Single Responsibility
 *
 * @param pageFormat - Format de pàgina actual
 * @param screenWidth - Amplada de la pantalla
 * @param screenHeight - Alçada de la pantalla
 * @param options - Com s'encabeix el full i si la columna d'ajustos hi és al costat
 * @returns Resultat dels càlculs d'escala
 */
export function useScaleCalculator(
  pageFormat: PageFormat,
  screenWidth: number,
  screenHeight: number,
  options: Pick<ScaleCalculationParams, "fit" | "settingsBeside"> = {},
): ScaleResult {
  const { fit, settingsBeside } = options;
  return useMemo(() => {
    return calculateDisplayDimensions({
      pageFormat,
      screenWidth,
      screenHeight,
      fit,
      settingsBeside,
    });
  }, [pageFormat, screenWidth, screenHeight, fit, settingsBeside]);
}

/**
 * Hook per obtenir les dimensions d'impressió
 *
 * @param pageFormat - Format de pàgina actual
 * @returns Dimensions per a impressió
 */
export function usePrintDimensions(pageFormat: PageFormat): PageDimensions {
  return useMemo(() => {
    return getPrintDimensions(pageFormat);
  }, [pageFormat]);
}
