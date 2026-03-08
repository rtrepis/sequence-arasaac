import { useMemo } from "react";
import {
  PageFormat,
  SCREEN_MARGINS,
  FOOTER_SPACE,
  isMediumScreen,
  PageDimensions,
} from "@/types/PageFormat";

/**
 * Paràmetres per al càlcul d'escala
 */
export interface ScaleCalculationParams {
  pageFormat: PageFormat;
  screenWidth: number;
  screenHeight: number;
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
  const { pageFormat, screenWidth, screenHeight } = params;
  const { dimensions, orientation } = pageFormat;

  // Determinar el marge segons la mida de pantalla
  const margin = isMediumScreen(screenWidth)
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

  // Ajustar si l'alçada supera l'espai disponible
  if (availableHeight + FOOTER_SPACE > screenHeight) {
    availableHeight = screenHeight - FOOTER_SPACE;
    availableWidth = (dimensions.width * availableHeight) / dimensions.height;
  }

  // Calcular escala basant-se en l'amplada
  const scale = availableWidth / dimensions.width; // 24 = PRINT_CONTAINER_PADDING

  return {
    displayWidth: availableWidth,
    displayHeight: availableHeight,
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
 * @returns Resultat dels càlculs d'escala
 */
export function useScaleCalculator(
  pageFormat: PageFormat,
  screenWidth: number,
  screenHeight: number,
): ScaleResult {
  return useMemo(() => {
    return calculateDisplayDimensions({
      pageFormat,
      screenWidth,
      screenHeight,
    });
  }, [pageFormat, screenWidth, screenHeight]);
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
