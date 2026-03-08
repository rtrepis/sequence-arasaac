import { SxProps, Theme } from "@mui/system";

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
    transition:
      "background-color 0.3s ease, color 0.3s ease, border-bottom 0.3s ease", // Transició suau per a fons, color i bordes
  },
  "& .MuiToggleButton-root:not(.Mui-selected):hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Fons blanc gairebé transparent en hover
    borderBottom: "1px solid whitesmoke", // Borde inferior per al hover
    color: "whitesmoke", // Color de text en hover
  },
  "& .Mui-selected": {
    borderBottom: "3px solid whitesmoke", // Col·loca un borde inferior quan està seleccionat
    backgroundColor: "transparent", // Fons transparent quan seleccionat
    color: "whitesmoke", // Text blanc quan seleccionat
    fontSize: "1.1rem", // Mida de lletra més gran per seleccionats
  },
  "& .Mui-selected:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Fons blanc gairebé transparent en hover també quan està seleccionat
    borderBottom: "3px solid whitesmoke", // Borde inferior seleccionat
    color: "whitesmoke", // Text seleccionat
  },
};

export const toggleButtonTypographyStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center", // Alinea text i icona verticalment
  gap: "8px", // Espai entre text i icona
  fontFamily: "SF.NS",
  fontSize: "inherit",
};
