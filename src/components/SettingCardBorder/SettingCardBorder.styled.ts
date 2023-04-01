import { SxProps } from "@mui/material";

export const card: SxProps = {
  paddingBlockStart: 1,
  borderTop: 1,
  borderTopColor: "secondary.light",
};

export const cardTitle: SxProps = {
  marginBottom: -1,
  fontWeight: "bold",
  alignSelf: { xs: "start", sm: "inherit" },
};

export const cardContent: SxProps = {
  flexWrap: { xs: "wrap", sm: "nowrap" },
  alignSelf: { xs: "start" },
  ".MuiButtonBase-root": { marginInLine: 1 },
};

export const cardAction: SxProps = {
  maxHeight: 40,
  lineHeight: 1.25,
  alignSelf: { xs: "end", sm: "inherit" },
  marginTop: { xs: 1, sm: 0 },
  marginBottom: { xs: 1, sm: 0 },
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
