import { Divider, Stack, Typography } from "@mui/material";
import React from "react";
import { SETTINGS_INDENT, SETTINGS_ROW_GAP } from "./settingsLayout.styled";

interface SectionTitleProps {
  /** Etiqueta de la secció. */
  title: React.ReactNode;
  /** Ajustos de la secció, renderitzats indentats sota el títol. */
  children: React.ReactNode;
}

/**
 * Secció completa d'ajustos: capçalera (etiqueta en majúscules + divisor) i
 * el seu contingut indentat a sota, com un esquema (títol arran de marge,
 * ajustos un nivell cap a dins). És el nivell superior de la jerarquia de
 * separació de l'estàndard de configuracions.
 */
const SectionTitle = ({ title, children }: SectionTitleProps): React.ReactElement => (
  <Stack direction="column" gap={0.5} sx={{ mt: 1 }}>
    <Typography
      variant="subtitle2"
      fontWeight="bold"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
    >
      {title}
    </Typography>
    <Divider />
    <Stack direction="column" gap={SETTINGS_ROW_GAP} sx={{ pl: SETTINGS_INDENT }}>
      {children}
    </Stack>
  </Stack>
);

export default SectionTitle;
