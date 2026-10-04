import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// MUI consulta `matchMedia` a cada `useMediaQuery` (els breakpoints dels tabs,
// el tema del sistema) i jsdom no la porta: sense això, qualsevol component amb
// un breakpoint peta abans de pintar-se.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// L'escala dels panells de configuració mesura el contenidor amb un
// ResizeObserver, que jsdom tampoc no implementa.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// El formulari d'edició vigila amb un IntersectionObserver si la mostra de la
// targeta ha sortit de pantalla; jsdom no en porta cap.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}
