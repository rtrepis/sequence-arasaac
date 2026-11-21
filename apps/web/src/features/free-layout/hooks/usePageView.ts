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

/**
 * L'`id` del contenidor de totes les pàgines pròpies: és el que va a pantalla
 * completa, perquè s'hi pugui passar de pàgina lliscant (N1 de
 * `docs/PLA-vista-mobil.md`). S'hi veu la pàgina que es mira.
 */
export const PAGES_FULLSCREEN_ID = "view-pages";

/**
 * Posa a pantalla completa la pàgina que es mira: amb pàgines pròpies, el
 * contenidor de totes (que ensenya la pàgina activa); sense, el marc del full.
 */
export const enterPageFullscreen = (index: number): void => {
  const target =
    document.getElementById(PAGES_FULLSCREEN_ID) ??
    document.getElementById(pageFrameId(index));
  void target?.requestFullscreen?.().catch(() => undefined);
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

/** L'amplada d'un element, en px: segueix els canvis de mida. */
export const useElementWidth = (
  ref: React.RefObject<HTMLElement | null>,
): number => {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(element.getBoundingClientRect().width);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
};

/** L'amplada i l'alçada d'un element, en px. */
export interface ElementSize {
  width: number;
  height: number;
}

/**
 * La mida d'un element, en px: segueix els canvis de mida. Retorna la `ref`
 * (de funció, perquè l'element pot canviar) i la mida, zero fins que es mesura.
 */
export const useElementSize = (): [
  (node: HTMLElement | null) => void,
  ElementSize,
] => {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const observer = React.useRef<ResizeObserver | null>(null);
  const observed = React.useRef<HTMLElement | null>(null);

  // Observa un element: el mesura ara i cada cop que canvia de mida
  const observe = React.useCallback((node: HTMLElement) => {
    observer.current?.disconnect();
    observer.current = null;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      );
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    observer.current = new ResizeObserver(update);
    observer.current.observe(node);
  }, []);

  // En muntar-se (també la segona vegada del `StrictMode`, que desmunta i
  // torna a muntar els efectes) es torna a observar el que ja hi havia
  useEffect(() => {
    if (observed.current) observe(observed.current);
    return () => {
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [observe]);

  // Un `null` no desconnecta res: React el passa en treure la `ref` d'un
  // element, i pot ser després de posar-la a un altre (la ref va d'una pàgina
  // a l'altra). Es deixa d'observar només quan arriba un element nou
  const ref = React.useCallback(
    (node: HTMLElement | null) => {
      if (!node || node === observed.current) return;
      observed.current = node;
      observe(node);
    },
    [observe],
  );

  return [ref, size];
};
