import { useEffect, useState } from "react";

/** La part de la finestra que es veu de debò. */
export interface VisibleViewport {
  /** Alçada visible (sense el teclat virtual, si és obert). */
  height: number;
  /** Distància de dalt de la finestra a dalt del que es veu. */
  top: number;
  /**
   * Distància de baix de la finestra a baix del que es veu: el que tapa el
   * teclat virtual quan el navegador no encongeix la finestra (Safari d'iOS).
   */
  bottom: number;
}

const readViewport = (): VisibleViewport => {
  const visual = window.visualViewport;

  // Sense `visualViewport` (navegadors vells, jsdom), la finestra sencera
  if (!visual) return { height: window.innerHeight, top: 0, bottom: 0 };

  return {
    height: visual.height,
    top: visual.offsetTop,
    bottom: Math.max(0, window.innerHeight - visual.height - visual.offsetTop),
  };
};

/**
 * Segueix la part visible de la pantalla. Amb el teclat virtual obert, Android
 * encongeix la finestra però el Safari d'iOS no: la deixa igual i hi posa el
 * teclat a sobre, i un element `position: fixed` a baix de tot hi queda
 * amagat. `visualViewport` és l'únic que diu el que queda de debò.
 */
export const useVisibleViewport = (): VisibleViewport => {
  const [viewport, setViewport] = useState<VisibleViewport>(readViewport);

  useEffect(() => {
    const update = (): void => {
      const next = readViewport();
      setViewport((current) =>
        current.height === next.height &&
        current.top === next.top &&
        current.bottom === next.bottom
          ? current
          : next,
      );
    };

    const visual = window.visualViewport;
    window.addEventListener("resize", update);
    visual?.addEventListener("resize", update);
    visual?.addEventListener("scroll", update);
    update();

    return () => {
      window.removeEventListener("resize", update);
      visual?.removeEventListener("resize", update);
      visual?.removeEventListener("scroll", update);
    };
  }, []);

  return viewport;
};
