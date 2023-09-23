import { createTheme } from "@mui/material";
import "../style/fonts.css";
import { fontList } from "../data/fontlist";

const theme = createTheme({
  palette: {
    primary: {
      light: "#E3EFDB",
      main: "#1B7D20",
      dark: "#175C1A",
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
