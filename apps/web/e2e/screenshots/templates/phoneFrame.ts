import {
  appBackgrounds,
  appPalette,
  printColors,
} from "../../../src/style/palette";

// Plantilla del marc de telèfon de les captures de mòbil (D3 de
// `docs/PLA-noticies.md`). Una captura de mòbil fa 412 px d'ample, molt menys
// que els 700 de `STEP`: tal qual, la pàgina de la notícia l'estiraria o la
// deixaria perduda en un costat. Dins d'un telèfon dibuixat, centrat a la mida
// de la notícia, es llegeix com el que és. Hi caben un o dos telèfons (abans i
// després), drets o ajaguts. Els colors surten de la paleta.

export interface PhoneScreen {
  /** La captura, com a `data:` URL */
  src: string;
  /** Mida de la captura en píxels CSS: en dona la proporció */
  width: number;
  height: number;
}

interface PhoneFrameOptions {
  /** Mida del dibuix: la de la notícia (`STEP` o `COVER`) */
  width: number;
  height: number;
}

// El cos del telèfon: el gris fosc del tema fosc, que no és el negre del text
const body = appBackgrounds.dark.paper;
const backdrop = appBackgrounds.light.paper;
const edge = appPalette.secondary.dark;
const screenBg = printColors.background;

/** Gruix del cos al voltant de la pantalla, i espai entre telèfons i vores. */
const BEZEL = 10;
const MARGIN = 24;
const GAP = 40;

/**
 * El dibuix sencer: els telèfons, a la mateixa escala i centrats. Cada
 * pantalla es fa tan gran com hi càpiga sense canviar-ne la proporció.
 */
export const phoneFrameHtml = (
  screens: PhoneScreen[],
  { width, height }: PhoneFrameOptions,
): string => {
  // L'escala comuna: la que fa cabre tots els telèfons, amb el seu cos, un al
  // costat de l'altre i de dalt a baix
  const n = screens.length;
  const sumWidths = screens.reduce((sum, screen) => sum + screen.width, 0);
  const tallest = Math.max(...screens.map((screen) => screen.height));
  const scale = Math.min(
    (width - MARGIN * 2 - GAP * (n - 1) - BEZEL * 2 * n) / sumWidths,
    (height - MARGIN * 2 - BEZEL * 2) / tallest,
  );
  const phones = screens
    .map((screen) => {
      const w = Math.round(screen.width * scale);
      const h = Math.round(screen.height * scale);
      return `<div class="phone"><img src="${screen.src}" style="width:${w}px;height:${h}px"></div>`;
    })
    .join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  #frame {
    width: ${width}px; height: ${height}px; background: ${backdrop};
    display: flex; align-items: center; justify-content: center; gap: ${GAP}px;
  }
  .phone {
    padding: ${BEZEL}px; background: ${body}; border-radius: ${BEZEL * 2.4}px;
    box-shadow: 0 0 0 2px ${edge};
  }
  .phone img {
    display: block; border-radius: ${BEZEL}px; background: ${screenBg};
  }
</style></head><body><div id="frame">${phones}</div></body></html>`;
};
