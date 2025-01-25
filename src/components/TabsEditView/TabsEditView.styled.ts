import { SxProps, Theme } from "@mui/system";

export const tabsStyled: SxProps<Theme> = {
  "& .MuiTabs-indicator": {
    bottom: "8px", // Pujar la línia
    height: "4px", // Gruix de la línia
    borderRadius: "2px", // Fer els extrems arrodonits
    backgroundColor: "whitesmoke", // Indicador en whitesmoke
  },
  "& .MuiTab-root": {
    paddingBottom: "8px", // Ajustar el padding del text dels tabs
    color: "grey", // Color del text dels tabs no seleccionats
    textTransform: "none",
    "&.Mui-selected": {
      color: "whitesmoke", // Color del text del tab seleccionat
    },
    "&:hover": {
      color: "#d3d3d3", // Color del text en passar el cursor
    },
  },
};
