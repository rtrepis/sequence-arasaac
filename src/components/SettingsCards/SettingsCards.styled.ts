import { SxProps } from "@mui/material";

export const card: SxProps = {
  minHeight: 70,
  marginBlockStart: 1,
  paddingBlockEnd: 1,
  borderBottom: 1,
  borderBottomColor: "secondary.light",
};

export const cardTitle: SxProps = {
  fontWeight: "bold",
};

export const cardContent: SxProps = {
  marginBlockStart: { xs: 0.1 },
  paddingInlineStart: 1,
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
