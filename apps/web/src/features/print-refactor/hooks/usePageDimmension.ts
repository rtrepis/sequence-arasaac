import { useMemo } from "react";
import { useScreenDPI } from "@/features/print-refactor/components/dpiDetector";
import {
  PageSize,
  PageOrientation,
  PageFormat,
  PageDimensions,
  PAPER_DIMENSIONS_MM,
  PRINT_MARGIN_MM,
} from "@/types/PageFormat";

/**
 * Hook que retorna dimensions de pàgina ajustades al DPI de l'usuari
 * Les dimensions es recalculen automàticament si l'usuari canvia de monitor
 * o ajusta el zoom del navegador
 */
export function usePageDimensions(
  size: PageSize,
  orientation: PageOrientation = "landscape",
): PageFormat {
  const screenInfo = useScreenDPI();

  const pageFormat = useMemo(() => {
    // Obtenir dimensions de paper
    const paperDimensions =
      size === "FULLSCREEN"
        ? { width: window.screen.width, height: window.screen.height }
        : PAPER_DIMENSIONS_MM[size];

    if (size === "FULLSCREEN") {
      return {
        size,
        orientation,
        dimensions: paperDimensions,
      };
    }

    // Calcular dimensions útils amb el DPI de l'usuari
    const usableWidthMM = paperDimensions.width - PRINT_MARGIN_MM * 2;
    const usableHeightMM = paperDimensions.height - PRINT_MARGIN_MM * 2;

    // Convertir a píxels amb DPI de l'usuari
    const widthPx = Math.round((usableWidthMM * screenInfo.dpi) / 25.4);
    const heightPx = Math.round((usableHeightMM * screenInfo.dpi) / 25.4);

    const dimensions: PageDimensions =
      orientation === "portrait"
        ? { width: heightPx, height: widthPx }
        : { width: widthPx, height: heightPx };

    return {
      size,
      orientation,
      dimensions,
    };
  }, [size, orientation, screenInfo.dpi]);

  return pageFormat;
}

/**
 * Hook per debug: mostra informació sobre dimensions i DPI
 */
export function usePageDimensionsDebug(
  size: PageSize,
  orientation: PageOrientation = "landscape",
) {
  const screenInfo = useScreenDPI();
  const pageFormat = usePageDimensions(size, orientation);

  return {
    pageFormat,
    screenInfo,
    debug: {
      dpi: screenInfo.dpi,
      pixelRatio: screenInfo.pixelRatio,
      screenType: screenInfo.type,
      dimensions: pageFormat.dimensions,
      dimensionsMM: {
        width: (pageFormat.dimensions.width * 25.4) / screenInfo.dpi,
        height: (pageFormat.dimensions.height * 25.4) / screenInfo.dpi,
      },
    },
  };
}
