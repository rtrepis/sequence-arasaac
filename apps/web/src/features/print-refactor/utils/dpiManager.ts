/**
 * Gestor Centralitzat de DPI
 *
 * Font única de veritat per a la detecció i conversió de DPI en tot el sistema.
 * Integra la detecció automàtica de DPI amb preferències d'usuari.
 *
 * @module dpiManager
 */

import {
  getScreenInfo,
  loadDPIPreference,
  getDevicePixelRatio,
  ScreenInfo,
} from "@/features/print-refactor/components/dpiDetector";

/* console.log("Current DPI:", getCurrentDPI());
logDPIInfo(); */

/**
 * DPI estàndard per defecte (CSS standard)
 */
export const DEFAULT_DPI = 96;

/**
 * Cache del DPI actual per evitar càlculs repetits
 */
let cachedDPI: number | null = null;
let lastPixelRatio: number | null = null;

/**
 * Invalida el cache de DPI
 * Cridar quan es canvia la preferència de l'usuari o es detecta un canvi de pantalla
 */
export function invalidateDPICache(): void {
  cachedDPI = null;
  lastPixelRatio = null;
}

/**
 * Obté el DPI actual a utilitzar en tot el sistema
 *
 * Prioritat:
 * 1. Preferència guardada per l'usuari
 * 2. DPI detectat de la pantalla
 * 3. DPI basat en devicePixelRatio
 * 4. DPI per defecte (96)
 *
 * @param forceRecalculate - Si true, força recàlcul ignorant cache
 * @returns DPI a utilitzar
 */
export function getCurrentDPI(forceRecalculate = false): number {
  // SSR fallback
  if (typeof window === "undefined") {
    return DEFAULT_DPI;
  }

  // Detectar si devicePixelRatio ha canviat (zoom o canvi de monitor)
  const currentPixelRatio = getDevicePixelRatio();
  if (lastPixelRatio !== null && lastPixelRatio !== currentPixelRatio) {
    invalidateDPICache();
  }
  lastPixelRatio = currentPixelRatio;

  // Retornar cache si està disponible
  if (!forceRecalculate && cachedDPI !== null) {
    return cachedDPI;
  }

  // 1. Intentar preferència guardada
  const preference = loadDPIPreference();
  if (preference !== null) {
    cachedDPI = preference;
    return preference;
  }

  // 2. Detectar DPI de la pantalla
  try {
    const screenInfo = getScreenInfo();
    cachedDPI = screenInfo.dpi;
    return screenInfo.dpi;
  } catch (error) {
    console.warn(
      "Error detecting DPI, falling back to devicePixelRatio:",
      error,
    );
  }

  // 3. Fallback a devicePixelRatio
  const dpi = DEFAULT_DPI * currentPixelRatio;
  cachedDPI = dpi;
  return dpi;
}

/**
 * Obté informació completa sobre el DPI i la pantalla
 *
 * @returns Informació de pantalla amb DPI actual
 */
export function getCurrentScreenInfo(): ScreenInfo & { activeDPI: number } {
  if (typeof window === "undefined") {
    return {
      dpi: DEFAULT_DPI,
      pixelRatio: 1,
      type: "standard",
      description: "Server-side render (default)",
      activeDPI: DEFAULT_DPI,
    };
  }

  const screenInfo = getScreenInfo();
  const activeDPI = getCurrentDPI();

  return {
    ...screenInfo,
    activeDPI,
  };
}

/**
 * Converteix mil·límetres a píxels utilitzant el DPI actual del sistema
 *
 * @param mm - Valor en mil·límetres
 * @param customDPI - DPI personalitzat (opcional, si no s'especifica usa getCurrentDPI())
 * @returns Valor en píxels (arrodonit)
 */
export function mmToPixels(mm: number, customDPI?: number): number {
  const dpi = customDPI ?? getCurrentDPI();
  return Math.round((mm * dpi) / 25.4);
}

/**
 * Converteix píxels a mil·límetres utilitzant el DPI actual del sistema
 *
 * @param pixels - Valor en píxels
 * @param customDPI - DPI personalitzat (opcional, si no s'especifica usa getCurrentDPI())
 * @returns Valor en mil·límetres
 */
export function pixelsToMM(pixels: number, customDPI?: number): number {
  const dpi = customDPI ?? getCurrentDPI();
  return (pixels * 25.4) / dpi;
}

/**
 * Inicialitza listeners per detectar canvis de DPI
 * Cridar al principi de l'aplicació (App.tsx o similar)
 */
export function initializeDPIListeners(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // Listener per canvis de resolució/monitor
  const handleResize = () => {
    const newPixelRatio = getDevicePixelRatio();
    if (lastPixelRatio !== null && lastPixelRatio !== newPixelRatio) {
      console.log(`DPI changed: ${lastPixelRatio} → ${newPixelRatio}`);
      invalidateDPICache();

      // Dispatch event personalitzat per notificar components
      window.dispatchEvent(
        new CustomEvent("dpi-change", {
          detail: {
            oldPixelRatio: lastPixelRatio,
            newPixelRatio,
            oldDPI: DEFAULT_DPI * (lastPixelRatio || 1),
            newDPI: getCurrentDPI(true),
          },
        }),
      );
    }
  };

  // Listener per canvis de devicePixelRatio (zoom)
  const mediaQuery = window.matchMedia(
    `(resolution: ${window.devicePixelRatio}dppx)`,
  );

  const handleMediaChange = () => {
    console.log("Media query changed, recalculating DPI");
    handleResize();
  };

  // Afegir listeners
  window.addEventListener("resize", handleResize);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleMediaChange);
  } else {
    // @@ts-expect-error - API antiga per compatibilitat
    mediaQuery.addListener(handleMediaChange);
  }

  // Retornar funció de cleanup
  return () => {
    window.removeEventListener("resize", handleResize);

    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener("change", handleMediaChange);
    } else {
      // @@ts-expect-error
      mediaQuery.removeListener(handleMediaChange);
    }
  };
}

/**
 * Hook de React per escoltar canvis de DPI
 * Utilitat per components que necessiten reaccionar a canvis de DPI
 */
export function useDPIChangeListener(
  callback: (newDPI: number) => void,
): void | (() => void) {
  if (typeof window === "undefined") return;

  const handleDPIChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.newDPI);
  };

  window.addEventListener("dpi-change", handleDPIChange);

  // Cleanup
  return () => {
    window.removeEventListener("dpi-change", handleDPIChange);
  };
}

/**
 * Utilitat per logging i debug
 */
export function logDPIInfo(): void {
  if (typeof window === "undefined") {
    console.log("Running on server, DPI info not available");
    return;
  }

  console.group("🖥️ DPI Manager Info");

  const screenInfo = getCurrentScreenInfo();
  console.log("Active DPI:", screenInfo.activeDPI);
  console.log("Detected DPI:", screenInfo.dpi);
  console.log("Pixel Ratio:", screenInfo.pixelRatio);
  console.log("Screen Type:", screenInfo.type);
  console.log("Description:", screenInfo.description);

  const preference = loadDPIPreference();
  console.log("User Preference:", preference ?? "None");

  console.log("Cached DPI:", cachedDPI ?? "Not cached");

  // Test conversions
  console.log("\nTest Conversions (210mm A4 width):");
  console.log("210mm →", mmToPixels(210), "px");
  console.log(
    mmToPixels(210),
    "px →",
    pixelsToMM(mmToPixels(210)).toFixed(1),
    "mm",
  );

  console.groupEnd();
}
