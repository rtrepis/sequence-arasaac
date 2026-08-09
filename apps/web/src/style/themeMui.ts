import { createTheme, Theme } from "@mui/material";
import "../style/fonts.css";
import { fontList } from "../data/fontlist";
import { appBackgrounds, appDividers, appPalette } from "./palette";

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
            color: "primary",
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
