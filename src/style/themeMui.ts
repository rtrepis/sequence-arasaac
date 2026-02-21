import { createTheme } from "@mui/material";
import "../style/fonts.css";
import { fontList } from "../data/fontlist";

const theme = createTheme({
  palette: {
    primary: {
      light: "#adf25e",
      main: "#8ac34a",
      dark: "#496628",
      contrastText: "#F3F3F3",
    },
    secondary: {
      light: "#CCCCCC",
      main: "#DDD9D9",
      dark: "#A6A6A6",
      contrastText: "#252525",
    },
  },
  typography: {
    body1: { fontSize: "1.175rem", fontWeight: "bold" },
    fontFamily: fontList.join(","),
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { minHeight: "50px" },
      },
    },
    MuiToolbar: { styleOverrides: { root: { minHeight: "50px" } } },
    MuiIconButton: {
      styleOverrides: {
        root: { color: "primary" },
        disabled: {
          opacity: 0.35,
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

export default theme;
