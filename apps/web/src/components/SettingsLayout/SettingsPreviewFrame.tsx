import { Box, SxProps, Theme } from "@mui/material";
import React from "react";

interface SettingsPreviewFrameProps {
  children: React.ReactNode;
  /**
   * Fons de la previsualització segons el patró de zones:
   * - "default" (per defecte): zona de treball (blanc/negre neutre), per a mostres
   *   de pictogrames o mockups de pàgina que no han d'alterar els colors del contingut.
   * - "paper": zona de configuració (gris verdós), per a una mostra que és un sol Card
   *   sobre el panell (evita que es vegi com un marc negre/blanc).
   */
  background?: "default" | "paper";
  sx?: SxProps<Theme>;
}

/**
 * Marc visual canònic de qualsevol previsualització dins del modal de configuracions:
 * vora subtil, cantonades arrodonides, ombra i overflow amagat. Unifica l'aspecte
 * del preview a tots els tabs; les dimensions les aporta el fill via `sx`.
 */
const SettingsPreviewFrame = ({
  children,
  background = "default",
  sx,
}: SettingsPreviewFrameProps): React.ReactElement => (
  <Box
    sx={{
      bgcolor:
        background === "paper" ? "background.paper" : "background.default",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      boxShadow: 1,
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default SettingsPreviewFrame;
