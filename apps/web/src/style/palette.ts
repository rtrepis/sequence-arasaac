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
 * Superfície de full: tota zona on es veu un pictograma (targetes d'edició,
 * full de la pàgina de vista, fullscreen i mostres de configuració) és sempre
 * paper blanc, en tema clar i en fosc — el que es veu és el que s'imprimeix.
 * El tema fosc governa el que envolta el full: barra, tabs, panells i controls.
 * Per això el token surt de `printColors`: full i paper són la mateixa cosa.
 */
export const sheetSurface = printColors.background;
