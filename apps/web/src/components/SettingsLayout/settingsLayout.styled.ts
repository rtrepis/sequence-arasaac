import { SxProps, Theme } from "@mui/material";

/**
 * Estils canònics de l'estàndard de configuracions.
 * Font única de veritat per a l'espaiat i la separació entre ajustos
 * a tots els tabs del modal de configuracions per defecte.
 */

/** Separació vertical (gap MUI) entre files d'ajustos dins d'una columna de controls. */
export const SETTINGS_ROW_GAP = 1;

/** Separació vertical (gap MUI) entre les dues zones (preview / controls) en escriptori. */
export const SETTINGS_ZONE_GAP = 4;

/** Amplada màxima del panell centrat (estàndard tauleta). */
export const SETTINGS_MAX_WIDTH = 900;

/**
 * Fila d'un ajust individual: només padding vertical per al ritme.
 * La separació visual entre ajustos ve del `gap` de la columna; el divisor
 * s'usa exclusivament sota el `SectionTitle` (agrupació), no entre files.
 */
export const settingRow: SxProps<Theme> = {
  paddingBlock: 0.5,
};

/**
 * Variant en línia de {@link settingRow}: títol a l'esquerra i control a la dreta.
 * Pensat per a ajustos amb toggles o switches (una sola línia).
 */
export const settingRowInline: SxProps<Theme> = {
  ...settingRow,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: 2,
  rowGap: 1,
};
