import { alpha } from "@mui/material";
import { SxProps, Theme } from "@mui/system";

// Toggle de pàgines sobre la NavBar verda: colors derivats de primary.contrastText
export const toggleButtonGroupStyles: SxProps<Theme> = {
  "& .MuiToggleButton-root": {
    border: "none", // Elimina tots els bordes
    borderBottom: "3px solid transparent", // Només un borde inferior transparent
    paddingBottom: "2px", // Afegeix padding inferior per espai
    textTransform: "none", // Text sense majúscules
    marginTop: "2px",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "0px",
    fontSize: "0.8rem",
    // Botons no seleccionats: atenuats però llegibles sobre el verd
    color: (theme: Theme) => alpha(theme.palette.primary.contrastText, 0.65),
    transition:
      "background-color 0.3s ease, color 0.3s ease, border-bottom 0.3s ease", // Transició suau per a fons, color i bordes
  },
  "& .MuiToggleButton-root:not(.Mui-selected):hover": {
    backgroundColor: (theme: Theme) =>
      alpha(theme.palette.primary.contrastText, 0.08), // Fons subtil en hover
    borderBottom: (theme: Theme) =>
      `1px solid ${theme.palette.primary.contrastText}`, // Borde inferior per al hover
    color: "primary.contrastText", // Color de text en hover
  },
  "& .Mui-selected": {
    borderBottom: (theme: Theme) =>
      `3px solid ${theme.palette.primary.contrastText}`, // Borde inferior quan està seleccionat
    backgroundColor: "transparent", // Fons transparent quan seleccionat
    color: "primary.contrastText", // Text quan seleccionat
    fontSize: "1.1rem", // Mida de lletra més gran per seleccionats
  },
  "& .Mui-selected:hover": {
    backgroundColor: (theme: Theme) =>
      alpha(theme.palette.primary.contrastText, 0.08), // Fons subtil en hover també quan està seleccionat
    borderBottom: (theme: Theme) =>
      `3px solid ${theme.palette.primary.contrastText}`, // Borde inferior seleccionat
    color: "primary.contrastText", // Text seleccionat
  },
};

export const toggleButtonTypographyStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center", // Alinea text i icona verticalment
  gap: "8px", // Espai entre text i icona
  fontFamily: "SF.NS",
  fontSize: "inherit",
};
