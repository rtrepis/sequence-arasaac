import { SxProps } from "@mui/material";

/**
 * Títol d'un ajust individual: fosc i en negreta, per distingir-lo del
 * títol de secció (`SectionTitle`, gris i en majúscules). Font única de
 * veritat per a aquest nivell — el consumeix `SettingRow`, i també algun
 * `FormLabel` solt, perquè `FormLabel` sobreescriu el color a
 * `text.secondary` per defecte i cal forçar-lo a `text.primary`.
 */
export const cardTitle: SxProps = {
  fontWeight: "bold",
  color: "text.primary",
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
