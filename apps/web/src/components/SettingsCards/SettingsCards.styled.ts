import { SxProps } from "@mui/material";

export const card: SxProps = {
  minHeight: 70,
  paddingBlock: 1,
  borderRadius: 1,
};

/**
 * Títol d'un ajust individual: fosc i en negreta, per distingir-lo del
 * títol de secció (`SectionTitle`, gris i en majúscules). Font única de
 * veritat per a aquest nivell — reutilitzat també fora de `SettingCard*`
 * (ex. `FormLabel` del tab Vista) perquè `FormLabel` sobreescriu el color
 * a `text.secondary` per defecte i cal forçar-lo a `text.primary`.
 */
export const cardTitle: SxProps = {
  fontWeight: "bold",
  color: "text.primary",
};

export const cardContent: SxProps = {
  marginBlockStart: { xs: 0.1 },
  //paddingInlineStart: 1,
  flexWrap: { xs: "wrap", sm: "nowrap" },
  ".MuiButtonBase-root": { marginInLine: 1 },
};

export const cardAction: SxProps = {
  maxHeight: 30,
  lineHeight: 1.25,
  marginTop: { xs: 0.1, sm: 0.2 },
  marginBottom: { xs: 0.1 },
};

export const cardColor: SxProps = {
  minWidth: 90,
  maxHeight: 80,
  lineHeight: 1.25,
  alignSelf: { xs: "end", sm: "inherit" },
  marginTop: { xs: 1, sm: 0 },
  marginBottom: { xs: 1, sm: 0 },
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: "bold",
  flexDirection: "column",
};
