// Com es mira una pàgina a la vista: portar-la a dalt de tot, i la pantalla
// completa d'una sola pàgina. Són estat de la pantalla: no van a Redux ni al
// paper.
import React, { useEffect, useLayoutEffect, useState } from "react";
import type { PageDimensions } from "@features/print/utils/pageFormat";

/** L'`id` de la secció d'una pàgina (la capçalera i el full). */
export const pageSectionId = (index: number): string => `view-page-${index}`;

/** L'`id` del marc del full d'una pàgina: és el que va a pantalla completa. */
export const pageFrameId = (index: number): string =>
  `view-page-frame-${index}`;

/**
 * Porta la pàgina a dalt de tot de la finestra. Espera un fotograma perquè
 * l'escala nova (ajustar a l'alçada o a l'amplada) ja hi sigui.
 */
export const scrollPageToTop = (index: number): void => {
  requestAnimationFrame(() =>
    // Sense pàgines pròpies, la pàgina única no té secció: el seu marc
    (
      document.getElementById(pageSectionId(index)) ??
      document.getElementById(pageFrameId(index))
    )?.scrollIntoView?.({ behavior: "smooth", block: "start" }),
  );
};

/** Posa a pantalla completa el full d'una pàgina. */
export const enterPageFullscreen = (index: number): void => {
  const frame = document.getElementById(pageFrameId(index));
  void frame?.requestFullscreen?.().catch(() => undefined);
};

/** L'`id` de l'element que és a pantalla completa, si n'hi ha cap. */
export const useFullscreenElementId = (): string | null => {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setId(document.fullscreenElement?.id || null);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  return id;
};

/** L'escala que fa cabre el full sencer a la pantalla, tan gran com es pugui. */
export const fullscreenScale = (page: PageDimensions): number =>
  Math.min(window.innerWidth / page.width, window.innerHeight / page.height);

/**
 * L'alçada que queda de la vora de dalt de l'element al peu de la finestra.
 * Un element enganxat (`sticky`) a dalt, un cop s'ha baixat, fa tota la
 * finestra.
 */
export const useAvailableHeight = (
  ref: React.RefObject<HTMLElement | null>,
): number | undefined => {
  const [height, setHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const update = () => {
      const element = ref.current;
      if (!element) return;
      const top = Math.max(0, element.getBoundingClientRect().top);
      setHeight(Math.max(0, window.innerHeight - top));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [ref]);
  return height;
};

/** L'alçada d'un element, en px, mentre `enabled`: segueix els canvis de mida. */
export const useElementHeight = (
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
): number => {
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const update = () => setHeight(element.getBoundingClientRect().height);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);
  return height;
};
