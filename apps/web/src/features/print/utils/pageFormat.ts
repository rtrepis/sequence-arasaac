/**
 * Tipus i configuracions dels formats de pàgina.
 *
 * Les mides surten del paper (ISO 216, en mil·límetres) i es converteixen amb
 * `CSS_PRINT_DPI`: el navegador imprimeix sempre a 96 DPI CSS, de manera que
 * la previsualització coincideix amb el full en qualsevol monitor. Aquest
 * fitxer feia abans un camí més llarg —demanava el DPI «de la pantalla» a un
 * detector que, per força, sempre retornava 96, perquè una polzada CSS val 96
 * píxels per definició.
 */

import type { PageSize } from "@sequence-arasaac/shared-types";
import { mmToPixels } from "./pageUnits";

// La mida de pàgina viatja dins del document i de l'API: la declara
// `shared-types` i aquí només es reexporta, perquè no n'hi hagi dues versions
// que puguin divergir
export type { PageSize };

/** Les mides que són un paper de debò: totes menys la pantalla sencera */
export type PaperSize = Exclude<PageSize, "FULLSCREEN">;

export type PageOrientation = "landscape" | "portrait";

export interface PageDimensions {
  width: number;
  height: number;
}

export interface PageFormat {
  size: PageSize;
  orientation: PageOrientation;
  dimensions: PageDimensions;
}

export interface ScreenMargins {
  small: number; // xs/sm screens
  medium: number; // md+ screens
}

/**
 * Marge d'impressió, en mil·límetres per cada costat.
 *
 * Mana dues coses alhora, i per això n'hi ha d'haver un de sol: és el que es
 * descompta del paper per calcular el full **i** el marge del `@page`. Amb els
 * dos números iguals, la caixa de la pàgina i el full fan exactament la mateixa
 * mida i el full queda centrat sol, sense que el navegador hagi d'encongir res
 * per fer-l'hi cabre.
 *
 * A 5 mm el full ocupa el 92 % de l'A4 (287 × 200 mm); a 10 mm n'ocupava el
 * 84 %. Per sota d'aquí es comença a trepitjar el que les impressores no poden
 * imprimir —la vora de sota és la més restrictiva de totes—, i el que passaria
 * llavors és que el navegador ampliaria el marge pel seu compte i encongiria
 * tot el full per fer-l'hi cabre. Si alguna impressora retalla el peu de
 * llicència, aquest és el número que s'ha de pujar.
 */
export const PRINT_MARGIN_MM = 5;

/**
 * Configuració de marges per a diferents mides de pantalla
 */
export const SCREEN_MARGINS: ScreenMargins = {
  small: 48,
  medium: 380,
};

/**
 * Espai reservat per al footer (copyright, etc.)
 */
export const FOOTER_SPACE = 150;

/**
 * Escala per defecte en mode fullscreen
 */
export const FULLSCREEN_SCALE = 0.82;

/**
 * Dimensions del paper en mil·límetres, en vertical.
 * ISO 216 (A4, A3): https://en.wikipedia.org/wiki/ISO_216
 * ANSI (Carta, 8,5 × 11″; Tabloide, 11 × 17″): https://en.wikipedia.org/wiki/Paper_size
 */
export const PAPER_DIMENSIONS_MM = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  LETTER: { width: 215.9, height: 279.4 },
  TABLOID: { width: 279.4, height: 431.8 },
} as const;

/**
 * Totes les mides de pàgina, en l'ordre en què les ofereix el selector.
 * És l'única llista: el selector, el `@page` i el PDF en surten.
 */
export const PAGE_SIZES: readonly PageSize[] = [
  "A4",
  "A3",
  "LETTER",
  "TABLOID",
  "FULLSCREEN",
];

/**
 * El nom de cada paper per a `@page { size }`. El CSS no diu «tabloid»: el
 * paper d'11 × 17″ s'hi diu `ledger` (CSS Paged Media, «page-size»).
 */
export const CSS_PAGE_SIZE: Record<PaperSize, string> = {
  A4: "A4",
  A3: "A3",
  LETTER: "letter",
  TABLOID: "ledger",
};

/**
 * Regions on el paper de cada dia és el Carta i no l'A4. És la llista
 * `paperSize` de les dades suplementàries del CLDR (Unicode), que `Intl` no
 * exposa. Hi ha el Canadà, els EUA, Mèxic i bona part de l'Amèrica Llatina.
 */
const LETTER_REGIONS: ReadonlySet<string> = new Set([
  "BZ",
  "CA",
  "CL",
  "CO",
  "CR",
  "GT",
  "MX",
  "NI",
  "PA",
  "PH",
  "PR",
  "SV",
  "US",
  "VE",
]);

/**
 * El paper per defecte segons les llengües del navegador (`navigator.languages`).
 *
 * Mana la primera que porta regió: «es-MX» diu Mèxic, i per tant Carta. Una
 * llengua sense regió («es», «en») no diu on és ningú, i llavors és A4, que és
 * el paper de la resta del món. No s'endevina la regió a partir de la llengua:
 * «en» sol seria els EUA, i és també qui escriu des del Regne Unit.
 */
export function regionalPaperSize(languages: readonly string[]): PaperSize {
  // La regió és la subetiqueta de dues lletres (o tres xifres, «es-419») que
  // ve després de la llengua i, si n'hi ha, de l'escriptura: «zh-Hant-TW»
  const region = languages
    .map((tag) =>
      tag
        .split(/[-_]/)
        .slice(1)
        .find((subtag) => /^([A-Za-z]{2}|\d{3})$/.test(subtag)),
    )
    .find((subtag) => subtag !== undefined);
  return region !== undefined && LETTER_REGIONS.has(region.toUpperCase())
    ? "LETTER"
    : "A4";
}

/**
 * DPI estàndard CSS — el navegador sempre imprimeix amb aquest valor,
 * independentment del DPI físic de la pantalla o del monitor connectat.
 */
export const CSS_PRINT_DPI = 96;

/**
 * Calcula les dimensions útils d'un paper descomptant marges.
 * Sempre a `CSS_PRINT_DPI`, perquè el preview coincideixi amb la impressió en
 * qualsevol monitor o `devicePixelRatio`.
 *
 * @param paperWidthMM - Amplada del paper en mm
 * @param paperHeightMM - Alçada del paper en mm
 * @param marginMM - Marge en mm (aplicat a cada costat)
 * @returns Dimensions útils en píxels a 96 DPI
 */
export function calculateUsableDimensions(
  paperWidthMM: number,
  paperHeightMM: number,
  marginMM: number = PRINT_MARGIN_MM,
): PageDimensions {
  const usableWidthMM = paperWidthMM - marginMM * 2;
  const usableHeightMM = paperHeightMM - marginMM * 2;

  return {
    width: mmToPixels(usableWidthMM, CSS_PRINT_DPI),
    height: mmToPixels(usableHeightMM, CSS_PRINT_DPI),
  };
}

/**
 * Crea la configuració d'una pàgina.
 *
 * @param size - Mida de pàgina (un paper o FULLSCREEN)
 * @param orientation - Orientació (landscape, portrait)
 * @returns El format, amb les dimensions útils en píxels d'impressió
 */
export function createPageFormat(
  size: PageSize,
  orientation: PageOrientation,
): PageFormat {
  let baseDimensions: PageDimensions;

  if (size === "FULLSCREEN") {
    const screenW = window.screen.width;
    const screenH = window.screen.height;
    // Les dimensions de pantalla ja reflecteixen l'orientació física
    // Usem max/min per garantir landscape=horitzontal, portrait=vertical
    const maxDim = Math.max(screenW, screenH);
    const minDim = Math.min(screenW, screenH);
    const dimensions: PageDimensions =
      orientation === "landscape"
        ? { width: maxDim, height: minDim }
        : { width: minDim, height: maxDim };
    return { size, orientation, dimensions };
  } else {
    // Les mides del paper, menys els marges, en píxels d'impressió
    const paperDimensions = PAPER_DIMENSIONS_MM[size];
    baseDimensions = calculateUsableDimensions(
      paperDimensions.width,
      paperDimensions.height,
    );
  }

  // Aplicar orientació
  const dimensions: PageDimensions =
    orientation === "landscape"
      ? { width: baseDimensions.height, height: baseDimensions.width }
      : baseDimensions;

  return {
    size,
    orientation,
    dimensions,
  };
}

/**
 * Utilitat per verificar si una mida de pantalla és medium o més gran
 *
 * @param screenWidth - Amplada de la pantalla en píxels
 * @returns true si és una pantalla medium (>900px)
 */
export function isMediumScreen(screenWidth: number): boolean {
  return screenWidth > 900;
}

