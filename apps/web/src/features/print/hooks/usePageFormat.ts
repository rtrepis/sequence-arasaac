import { useCallback, useState, useMemo } from "react";
import {
  PageSize,
  PageOrientation,
  PageFormat,
  createPageFormat,
} from "../utils/pageFormat";

/**
 * Configuració del hook de format de pàgina
 */
export interface PageFormatConfig {
  initialSize?: PageSize;
  initialOrientation?: PageOrientation;
}

/**
 * Resultat del hook de format de pàgina
 */
export interface PageFormatState {
  pageFormat: PageFormat;
  pageSize: PageSize;
  orientation: PageOrientation;
  setPageSize: (size: PageSize) => void;
  toggleOrientation: () => void;
  setOrientation: (orientation: PageOrientation) => void;
  isLandscape: boolean;
  isFullscreen: boolean;
}

/**
 * Hook custom per gestionar el format de pàgina amb detecció de DPI
 * Segueix el principi de Single Responsibility
 *
 * Manté dues orientacions independents: una per als papers i una per Full Screen
 * Això permet que el Full Screen tingui una orientació independent dels formats de paper
 *
 * @param config - Configuració inicial
 * @returns Estat i funcions per gestionar el format de pàgina
 */
export function usePageFormat(config: PageFormatConfig = {}): PageFormatState {
  const { initialSize = "A4", initialOrientation = "landscape" } = config;

  const [pageSize, setPageSizeState] = useState<PageSize>(initialSize);
  // Mantenir orientacions independents per als papers vs Full Screen
  const [orientationPaper, setOrientationPaper] =
    useState<PageOrientation>(initialOrientation);
  const [orientationFullscreen, setOrientationFullscreen] =
    useState<PageOrientation>("landscape");

  // Seleccionar l'orientació correcta segons la mida de pàgina
  const orientation =
    pageSize === "FULLSCREEN" ? orientationFullscreen : orientationPaper;

  // Les dimensions d'impressió són sempre a 96 DPI CSS — no depenen del DPI de pantalla
  const pageFormat = useMemo(() => {
    return createPageFormat(pageSize, orientation);
  }, [pageSize, orientation]);

  const isLandscape = orientation === "landscape";
  const isFullscreen = pageSize === "FULLSCREEN";

  /**
   * Canvia la mida de la pàgina
   */
  const setPageSize = useCallback((size: PageSize) => {
    setPageSizeState(size);
  }, []);

  /**
   * Canvia l'orientació de la pàgina
   * Actualitza l'orientació correcta segons la mida actual
   */
  const setOrientation = useCallback(
    (newOrientation: PageOrientation) => {
      if (pageSize === "FULLSCREEN") {
        setOrientationFullscreen(newOrientation);
      } else {
        setOrientationPaper(newOrientation);
      }
    },
    [pageSize],
  );

  /**
   * Alterna entre landscape i portrait
   * Alterna l'orientació correcta segons la mida actual
   */
  const toggleOrientation = useCallback(() => {
    if (pageSize === "FULLSCREEN") {
      setOrientationFullscreen((prev) =>
        prev === "landscape" ? "portrait" : "landscape",
      );
    } else {
      setOrientationPaper((prev) =>
        prev === "landscape" ? "portrait" : "landscape",
      );
    }
  }, [pageSize]);

  return {
    pageFormat,
    pageSize,
    orientation,
    setPageSize,
    toggleOrientation,
    setOrientation,
    isLandscape,
    isFullscreen,
  };
}
