import { alpha } from "@mui/material";
import { SxProps, Theme } from "@mui/system";

// Tabs sobre la NavBar verda: tots els colors deriven de primary.contrastText
export const tabsStyled: SxProps<Theme> = {
  "& .MuiTabs-indicator": {
    bottom: "8px", // Pujar la línia
    height: "4px", // Gruix de la línia
    borderRadius: "2px", // Fer els extrems arrodonits
    backgroundColor: "primary.contrastText",
  },
  "& .MuiTab-root": {
    paddingBottom: "8px", // Ajustar el padding del text dels tabs
    // Tabs no seleccionats: atenuats però llegibles sobre el verd
    color: (theme: Theme) => alpha(theme.palette.primary.contrastText, 0.65),
    textTransform: "none",
    "&.Mui-selected": {
      color: "primary.contrastText",
    },
    "&:hover": {
      color: (theme: Theme) => alpha(theme.palette.primary.contrastText, 0.85),
    },
  },
};
