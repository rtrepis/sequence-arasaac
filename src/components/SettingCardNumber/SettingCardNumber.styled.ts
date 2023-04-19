import { SxProps } from "@mui/material";

export const card: SxProps = {
  marginBlockStart: 1,
  paddingBlockEnd: 1,
  borderBottom: 1,
  borderBottomColor: "secondary.light",
};

export const cardTitle: SxProps = {
  fontWeight: "bold",
};

export const cardAction: SxProps = {
  maxHeight: 40,
  lineHeight: 1.25,
  alignSelf: { xs: "end" },
  marginTop: { xs: 0, sm: 0 },
  marginBottom: { xs: 0.1 },
};
