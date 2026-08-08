import { Box, SxProps, Theme } from "@mui/material";
import React from "react";
import { sheetSurface } from "../../style/palette";

interface SettingsPreviewFrameProps {
  children: React.ReactNode;
  /**
   * Fons de la previsualització segons el patró de zones:
   * - "default" (per defecte): superfície de full (blanca en tots dos temes), per a
   *   mockups de pàgina i mostres que han de reflectir el resultat imprès.
   * - "paper": zona de configuració (gris verdós), per a una mostra que és un sol Card
   *   sobre el panell (el card ja és blanc: el paper li fa de passe-partout).
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
      bgcolor: background === "paper" ? "background.paper" : sheetSurface,
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
