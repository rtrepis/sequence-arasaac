import { Divider, Stack, Typography } from "@mui/material";
import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
}

/**
 * Capçalera d'una secció d'ajustos: etiqueta en majúscules + divisor.
 * És el nivell superior de la jerarquia de separació de l'estàndard de
 * configuracions (agrupa un conjunt de files d'ajustos relacionats).
 */
const SectionTitle = ({ children }: SectionTitleProps): React.ReactElement => (
  <Stack direction="column" gap={0.5} sx={{ mt: 1 }}>
    <Typography
      variant="subtitle2"
      fontWeight="bold"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
    >
      {children}
    </Typography>
    <Divider />
  </Stack>
);

export default SectionTitle;
