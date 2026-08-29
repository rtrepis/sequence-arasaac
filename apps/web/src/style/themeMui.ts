import { createTheme, Theme } from "@mui/material";
import "../style/fonts.css";
import { fontList } from "../data/fontlist";
import { appBackgrounds, appDividers, appPalette } from "./palette";
import { APP_CORNER_RADIUS } from "./appShape";

export const buildTheme = (mode: "light" | "dark"): Theme =>
  createTheme({
    palette: {
      mode,
      ...appPalette,
      background: appBackgrounds[mode],
      divider: appDividers[mode],
    },
    typography: {
      body1: { fontSize: "1.175rem", fontWeight: "bold" },
      fontFamily: fontList.join(","),
    },
    components: {
      // Sense overlay d'elevació: el gris de configuració (background.paper)
      // és el mateix a totes les superfícies, independentment de l'elevation
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      // La cantonada de la casa per a tota capa flotant: cap diàleg no se l'ha
      // de tornar a escriure al seu `sx` (fins ara només la duia el modal
      // d'edició). El `fullScreen` en queda fora: una pantalla sencera no té
      // cantonades, i MUI aplica `paperFullScreen` després de `paper`.
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: `${APP_CORNER_RADIUS}px` },
          paperFullScreen: { borderRadius: 0 },
        },
      },
      MuiAppBar: {
        // La NavBar mostra el verd oficial (primary) també en mode fosc
        defaultProps: { enableColorOnDark: true },
        styleOverrides: {
          root: { minHeight: "50px" },
        },
      },
      MuiToolbar: { styleOverrides: { root: { minHeight: "50px" } } },
      MuiIconButton: {
        styleOverrides: {
          root: {
            // Aquí hi havia `color: "primary"`, que no és cap valor CSS vàlid:
            // el navegador el descartava i les icones sortien amb el gris per
            // defecte de MUI. Es treu perquè era una trampa, no una decisió:
            // «arreglar-lo» posant-hi el verd de debò deixaria totes les icones
            // de l'app a 2,1:1 sobre el paper (F11). El color el tria qui fa
            // servir el botó, i sobre paper o full és sempre `inherit`.
            "&.Mui-disabled": {
              opacity: 0.35,
            },
          },
        },
      },
      // Desactiva transicions i animacions per a usuaris que ho demanen al SO
      MuiCssBaseline: {
        styleOverrides: `
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `,
      },
    },
  });

export default buildTheme("light");
