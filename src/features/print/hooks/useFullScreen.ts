import { useCallback, useEffect, useState } from "react";
import { FULLSCREEN_SCALE } from "@/types/PageFormat";

/**
 * Selector CSS per al contenidor de fullscreen
 */
const FULLSCREEN_CONTAINER_SELECTOR = ".displayFullScreen";

/**
 * Configuració del hook de fullscreen
 */
export interface FullscreenConfig {
  onEnter?: () => void;
  onExit?: () => void;
  scale?: number;
}

/**
 * Resultat del hook de fullscreen
 */
export interface FullscreenState {
  isFullscreen: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  currentScale: number;
}

/**
 * Hook custom per gestionar el mode fullscreen
 * Segueix el principi de Single Responsibility
 *
 * @param config - Configuració opcional
 * @returns Estat i funcions per gestionar fullscreen
 */
export function useFullscreen(config: FullscreenConfig = {}): FullscreenState {
  const { onEnter, onExit, scale = FULLSCREEN_SCALE } = config;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  /**
   * Entra en mode fullscreen
   */
  const enterFullscreen = useCallback(async () => {
    const display = document.querySelector(FULLSCREEN_CONTAINER_SELECTOR);

    if (!display) {
      console.warn("Fullscreen container not found");
      return;
    }

    try {
      // Mostrar el contenidor
      display.setAttribute("style", "display: flex");

      // Entrar en fullscreen
      await display.requestFullscreen();

      setIsFullscreen(true);
      setCurrentScale(scale);

      onEnter?.();
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      // Amagar el contenidor si hi ha error
      display.setAttribute("style", "display: none");
    }
  }, [scale, onEnter]);

  /**
   * Surt del mode fullscreen
   */
  const exitFullscreen = useCallback(async () => {
    const display = document.querySelector(FULLSCREEN_CONTAINER_SELECTOR);

    if (!display) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      display.setAttribute("style", "display: none");
      setIsFullscreen(false);

      onExit?.();
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
    }
  }, [onExit]);

  /**
   * Escoltar canvis en l'estat de fullscreen
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const display = document.querySelector(FULLSCREEN_CONTAINER_SELECTOR);

      if (document.fullscreenElement === null && isFullscreen) {
        // L'usuari ha sortit de fullscreen (ESC, etc.)
        display?.setAttribute("style", "display: none");
        setIsFullscreen(false);
        onExit?.();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen, onExit]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    currentScale,
  };
}

/**
 * Utilitat per verificar si el navegador suporta fullscreen
 */
export function isFullscreenSupported(): boolean {
  return (
    document.fullscreenEnabled ||
    // @ts-expect-error - vendor prefixes
    document.webkitFullscreenEnabled ||
    // @ts-expect-error - vendor prefixes
    document.mozFullScreenEnabled ||
    // @ts-expect-error - vendor prefixes
    document.msFullscreenEnabled
  );
}
