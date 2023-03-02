import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      light: "#31DC39",
      main: "#1B7D20",
      dark: "#175C1A",
      contrastText: "#E3E3E3",
    },
    secondary: {
      light: "#FAFAFA",
      main: "#D9D9D9",
      dark: "#A6A6A6",
      contrastText: "#252525",
    },
  },
  typography: {
    body1: { fontSize: "1.175rem", fontWeight: "bold" },
  },
});

export default theme;
