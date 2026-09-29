import { SxProps } from "@mui/material";

export const settingsList: SxProps = { marginBlock: 2 };

// Amb una franja enganxada a sobre: el marge i les cantonades de dalt són de
// la franja, i tots dos fan un sol bloc
export const settingsListAttached: SxProps = {
  marginBlock: 2,
  "&, &.Mui-expanded": { marginTop: 0 },
  "&:last-of-type": { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
};

export const settingsListTitle: SxProps = {
  ".MuiAccordionSummary-content": {
    minHeight: 0,
    margin: 0,
    justifyContent: "center",
  },
};

// Com l'`IconButton` que hi havia abans (mateixa mida i color), però
// decorativa: la capçalera ja és el botó
export const settingsListTitleContent: SxProps = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  color: "action.active",
  padding: 0,
  fontSize: "2rem",
};

export const settingsContent: SxProps = { display: "block", padding: 1 };
