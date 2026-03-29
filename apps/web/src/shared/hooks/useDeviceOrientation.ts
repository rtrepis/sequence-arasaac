import { useEffect, useState, useCallback } from "react";

/**
 * Hook per detectar la rotació del dispositiu en mòbils i tauletes
 * Permite sincronitzar la visualització amb l'orientació física del dispositiu
 *
 * @returns L'orientació actual del dispositiu ('portrait' o 'landscape')
 */
export function useDeviceOrientation(): "portrait" | "landscape" {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    () => {
      // Determinar l'orientació inicial
      return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    },
  );

  const handleOrientationChange = useCallback(() => {
    // Usar window.innerHeight vs window.innerWidth per detectar rotació
    const newOrientation =
      window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    setOrientation(newOrientation);
  }, []);

  useEffect(() => {
    // Escoltar canvis en la mida de la finestra (cobre rotació en mòbils)
    window.addEventListener("resize", handleOrientationChange);

    // Escoltar l'event orientationchange (més fiable en alguns dispositius)
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [handleOrientationChange]);

  return orientation;
}

/**
 * Utilitat per detectar si és un dispositiu mòbil o tauleta
 *
 * @param screenWidth - Amplada de la pantalla en píxels
 * @returns true si és mòbil/tauleta (< 1024px)
 */
export function isMobileDevice(screenWidth: number): boolean {
  return screenWidth < 1024;
}
