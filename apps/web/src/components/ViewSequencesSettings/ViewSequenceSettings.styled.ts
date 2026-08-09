import { SxProps } from "@mui/material";

/**
 * Amplada (px) de la columna de configuració de la pàgina de vista en escriptori.
 * Més ampla que el mínim del control (150px) més el títol, perquè les files hi
 * càpiguen en línia sense partir-se.
 */
export const VIEW_SETTINGS_COLUMN_WIDTH = 350;

export const tab: SxProps = {
  display: "flex",
  width: 100,
  height: 40,
  backgroundColor: "primary.main",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  textAlign: "center",
  justifyContent: "center",
  alignItems: "center",
};
