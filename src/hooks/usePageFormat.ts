import { useCallback, useState } from "react";
import {
  PageSize,
  PageOrientation,
  PageFormat,
  createPageFormat,
} from "@/types/PageFormat";

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
 * Hook custom per gestionar el format de pàgina
 * Segueix el principi de Single Responsibility
 *
 * @param config - Configuració inicial
 * @returns Estat i funcions per gestionar el format de pàgina
 */
export function usePageFormat(config: PageFormatConfig = {}): PageFormatState {
  const { initialSize = "A4", initialOrientation = "landscape" } = config;

  const [pageSize, setPageSizeState] = useState<PageSize>(initialSize);
  const [orientation, setOrientationState] =
    useState<PageOrientation>(initialOrientation);

  const pageFormat = createPageFormat(pageSize, orientation);
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
   */
  const setOrientation = useCallback((newOrientation: PageOrientation) => {
    setOrientationState(newOrientation);
  }, []);

  /**
   * Alterna entre landscape i portrait
   */
  const toggleOrientation = useCallback(() => {
    setOrientationState((prev) =>
      prev === "landscape" ? "portrait" : "landscape",
    );
  }, []);

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
