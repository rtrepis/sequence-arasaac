import { createTheme } from "@mui/material";
import "../style/fonts.css";
import { fontList } from "../data/fontlist";

const theme = createTheme({
  palette: {
    primary: {
      light: "#9cc48c",
      main: "#55a236",
      dark: "#47872d",
      contrastText: "#F3F3F3",
    },
    secondary: {
      light: "#CCCCCC",
      main: "#D9D9D9",
      dark: "#A6A6A6",
      contrastText: "#252525",
    },
  },
  typography: {
    body1: { fontSize: "1.175rem", fontWeight: "bold" },
    fontFamily: fontList.join(","),
  },
});

export default theme;
