import { SimplePaletteColorOptions } from "@mui/material";

/**
 * Tokens de color de SequenciAAC — única font de veritat de la paleta.
 * El verd oficial de l'app és `primary.main` (el de la NavBar).
 * Cap component ha de hardcodejar colors: sempre `theme.palette.*`.
 * Sobre superfícies verdes (NavBar, botons primary) el text i les icones
 * usen `primary.contrastText` (fosc, contrast 7,2:1 — WCAG AA).
 */
interface AppPalette {
  primary: SimplePaletteColorOptions;
  secondary: SimplePaletteColorOptions;
}

export const appPalette: AppPalette = {
  primary: {
    light: "#adf25e",
    main: "#8ac34a",
    dark: "#496628",
    contrastText: "#1E2A12",
  },
  // Grisos amb matís verd perquè harmonitzin amb el primary
  secondary: {
    light: "#EDF1E7",
    main: "#E3E8DC",
    dark: "#A9B39C",
    contrastText: "#252525",
  },
};

/**
 * Patró de zones per fons:
 * - `background.default` = ESCRIPTORI (el fons sobre el qual sura el full):
 *   blanc en clar, negre en fosc.
 * - `background.paper` = ZONA DE CONFIGURACIÓ (diàlegs, panells, controls):
 *   gris verdós clar en clar, gris verdós fosc en fosc.
 * - La superfície on es veuen els pictogrames no és cap de les dues: és
 *   `sheetSurface` (vegeu més avall).
 */
export const appBackgrounds: Record<
  "light" | "dark",
  { default: string; paper: string }
> = {
  light: { default: "#FFFFFF", paper: "#F2F5EC" },
  dark: { default: "#121212", paper: "#242820" },
};

/**
 * Separadors (token `divider` del tema): mateixa intensitat percebuda en
 * clar i en fosc — visibles però discrets sobre el paper de configuració.
 */
export const appDividers: Record<"light" | "dark", string> = {
  light: "rgba(0, 0, 0, 0.15)",
  dark: "rgba(255, 255, 255, 0.15)",
};

/**
 * Colors d'impressió i exportació a PDF: el paper sempre és blanc i el text
 * per defecte negre, independentment del tema actiu (clar o fosc).
 * Els colors de contingut triats per l'usuari (font, vores, fitzgerald)
 * es mantenen intactes; només es normalitzen els colors derivats del tema.
 */
export const printColors = {
  background: "#FFFFFF",
  text: "#000000",
} as const;

/**
 * Les vores dels estils de l'app de la Galeria d'estils (pla dels estils, pas
 * 9; `docs/estudis/ESTUDI-estils-de-targetes.md`): la tinta del paper i el gris
 * de la vora d'origen de la targeta. Són contingut: en triar l'estil es copien
 * al document i s'imprimeixen tal qual, en tots dos temes.
 */
export const appStyleBorderColors = {
  ink: printColors.text,
  grey: "#999999",
} as const;

/**
 * Superfície de full: tota zona on es veu un pictograma (targetes d'edició,
 * full de la pàgina de vista, fullscreen i mostres de configuració) és sempre
 * paper blanc, en tema clar i en fosc — el que es veu és el que s'imprimeix.
 * El tema fosc governa el que envolta el full: barra, tabs, panells i controls.
 * Per això el token surt de `printColors`: full i paper són la mateixa cosa.
 */
export const sheetSurface = printColors.background;

/**
 * Avís damunt del full: la marca «el text no hi cap» de la graella d'edició.
 * És el `warning.dark` del tema clar de MUI, fix en tots dos temes perquè és
 * damunt del full i el full no s'adapta al tema: 3,8:1 amb el blanc del full i
 * amb el glif blanc que porta a dins.
 */
export const sheetWarning = "#e65100";

/**
 * Guia d'edició damunt del full: el contorn de cada caixa del mode lliure i
 * les marques que diuen com és (ADR-005). És el gris 700 de Material: 6,1:1
 * amb el blanc del full, per damunt del 3:1 que demana un contorn (WCAG
 * 1.4.11), i fix en tots dos temes perquè és damunt del full. **Mai** surt al
 * paper ni al PDF: és un estat de l'edició, no del document.
 */
export const sheetGuide = "#616161";

/**
 * Les tres seqüències de la mostra del panell «Pàgina i distribució» (pas
 * 7c): tres colors clars ben diferents perquè es vegi on va cadascuna, amb el
 * número de cada pictograma en `printColors.text` (més de 10:1 amb tots tres).
 * Són damunt del full, que no s'adapta al tema: fixos en tots dos. No són
 * colors de contingut: no surten mai a cap document.
 */
export const previewSequenceColors = ["#C5E1A5", "#90CAF9", "#FFCC80"] as const;

/**
 * Franja de dalt del panell de baix (`AppBottomSheet`) quan és a sencer: un vel
 * fosc sobre el que hi ha a sota, que diu «això no és el full, és un botó que
 * torna a mig». Fosc en tots dos temes, perquè sota hi ha el full, que és blanc
 * sempre; el text hi va en blanc: amb el vel al 72 % damunt del blanc del full, fa
 * 7,3:1 (al 55 % de l'esbós, es quedava a 4:1).
 */
export const bottomSheetStrip: Record<
  "light" | "dark",
  { background: string; text: string }
> = {
  light: { background: "rgba(20, 26, 12, 0.72)", text: "#FFFFFF" },
  dark: { background: "rgba(0, 0, 0, 0.72)", text: "#FFFFFF" },
};

/**
 * La fletxa de la vora (`docs/estandards/capes-flotants.md`, «La fletxa de la
 * vora»): semitransparent, perquè sura damunt del full sense amagar-lo. Igual
 * en tots dos temes, perquè a sota hi ha el full, que és blanc sempre: el fons
 * blanc al 80 % i la fletxa fosca de `primary.contrastText` fan 12:1.
 */
export const edgeArrow = {
  background: "rgba(255, 255, 255, 0.8)",
  icon: appPalette.primary.contrastText,
} as const;

/** Un color `#RRGGBB` de la paleta amb transparència. */
const translucent = (hex: string, opacity: number): string => {
  const [r, g, b] = [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  );
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * La capa del mòbil girat (`docs/estandards/capes-flotants.md`): el fons de
 * l'escriptori del tema (`appBackgrounds.*.default`, blanc en clar i negre en
 * fosc) translúcid. Al 92 %, el que hi ha a sota s'endevina però no distreu. El
 * text, el del contrast de cada tema: el fosc de `primary.contrastText` sobre
 * blanc (més de 12:1) i el blanc del paper sobre negre (més de 15:1).
 */
export const rotateVeil: Record<
  "light" | "dark",
  { background: string; text: string }
> = {
  light: {
    background: translucent(appBackgrounds.light.default, 0.92),
    text: appPalette.primary.contrastText ?? printColors.text,
  },
  dark: {
    background: translucent(appBackgrounds.dark.default, 0.92),
    text: printColors.background,
  },
};

/**
 * Els punts de la quadrícula del mode lliure (`GridDots`): la guia del full
 * (`sheetGuide`) translúcida, perquè es vegin per moure-hi els blocs sense
 * competir amb els pictogrames. Fixos en tots dos temes: són damunt del full.
 */
export const sheetGridDot = translucent(sheetGuide, 0.35);
