import { useCallback, useState, useMemo } from "react";
import {
  PageSize,
  PageOrientation,
  PageFormat,
  createPageFormat,
} from "@/types/PageFormat";
import { useScreenDPI } from "@/features/print-refactor/components/dpiDetector";

/**
 * Índex de pàgina per a compatibilitat amb el codi existent
 */
export type PageSizeIndex = 0 | 1 | 2;

/**
 * Mapatge entre índex i PageSize
 */
const PAGE_SIZE_MAP: Record<PageSizeIndex, PageSize> = {
  0: "A4",
  1: "A3",
  2: "FULLSCREEN",
};

/**
 * Mapatge invers
 */
const PAGE_INDEX_MAP: Record<PageSize, PageSizeIndex> = {
  A4: 0,
  A3: 1,
  FULLSCREEN: 2,
};

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
  pageSizeIndex: PageSizeIndex;
  orientation: PageOrientation;
  setPageSize: (size: PageSize) => void;
  setPageSizeByIndex: (index: PageSizeIndex) => void;
  toggleOrientation: () => void;
  setOrientation: (orientation: PageOrientation) => void;
  isLandscape: boolean;
  isFullscreen: boolean;
}

/**
 * Hook custom per gestionar el format de pàgina amb detecció de DPI
 * Segueix el principi de Single Responsibility
 *
 * Manté dues orientacions independents: una per A4/A3 i una per Full Screen
 * Això permet que el Full Screen tingui una orientació independent dels formats de paper
 *
 * @param config - Configuració inicial
 * @returns Estat i funcions per gestionar el format de pàgina
 */
export function usePageFormat(config: PageFormatConfig = {}): PageFormatState {
  const { initialSize = "A4", initialOrientation = "landscape" } = config;

  const [pageSize, setPageSizeState] = useState<PageSize>(initialSize);
  // Mantenir orientacions independents per A4/A3 vs Full Screen
  const [orientationA4A3, setOrientationA4A3] =
    useState<PageOrientation>(initialOrientation);
  const [orientationFullscreen, setOrientationFullscreen] =
    useState<PageOrientation>("landscape");

  // Detectar DPI per recalcular dimensions quan canvia zoom/monitor
  const screenInfo = useScreenDPI();

  // Seleccionar l'orientació correcta segons la mida de pàgina
  const orientation =
    pageSize === "FULLSCREEN" ? orientationFullscreen : orientationA4A3;

  // Recalcular pageFormat quan canvia DPI, size o orientation
  const pageFormat = useMemo(() => {
    return createPageFormat(pageSize, orientation);
  }, [pageSize, orientation, screenInfo.dpi]);

  const pageSizeIndex = PAGE_INDEX_MAP[pageSize];
  const isLandscape = orientation === "landscape";
  const isFullscreen = pageSize === "FULLSCREEN";

  /**
   * Canvia la mida de la pàgina
   */
  const setPageSize = useCallback((size: PageSize) => {
    setPageSizeState(size);
  }, []);

  /**
   * Canvia la mida de la pàgina per índex (per compatibilitat)
   */
  const setPageSizeByIndex = useCallback((index: PageSizeIndex) => {
    const size = PAGE_SIZE_MAP[index];
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
        setOrientationA4A3(newOrientation);
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
      setOrientationA4A3((prev) =>
        prev === "landscape" ? "portrait" : "landscape",
      );
    }
  }, [pageSize]);

  return {
    pageFormat,
    pageSize,
    pageSizeIndex,
    orientation,
    setPageSize,
    setPageSizeByIndex,
    toggleOrientation,
    setOrientation,
    isLandscape,
    isFullscreen,
  };
}
