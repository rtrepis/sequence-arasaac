import { Box, Stack } from "@mui/material";
import React from "react";
import {
  SETTINGS_ROW_GAP,
  SETTINGS_ZONE_GAP,
  SETTINGS_MAX_WIDTH,
  SETTINGS_APPBAR_OFFSET,
} from "./settingsLayout.styled";

interface SettingsPanelLayoutProps {
  /** Contingut de la previsualització (ja embolcallat amb SettingsPreviewFrame). Opcional. */
  preview?: React.ReactNode;
  /** Columna de controls (files d'ajustos). */
  children: React.ReactNode;
  /** Amplada màxima del panell centrat. Per defecte SETTINGS_MAX_WIDTH (estàndard tauleta). */
  maxWidth?: number;
  /** Separació vertical entre files de la columna de controls. Per defecte SETTINGS_ROW_GAP. */
  controlsGap?: number;
}

/**
 * Layout canònic de dues zones d'un tab de configuracions:
 * previsualització a l'esquerra (sticky en mòbil) + columna de controls a la dreta.
 * Si no es passa `preview`, la columna de controls s'ocupa sola i queda centrada.
 */
const SettingsPanelLayout = ({
  preview,
  children,
  maxWidth = SETTINGS_MAX_WIDTH,
  controlsGap = SETTINGS_ROW_GAP,
}: SettingsPanelLayoutProps): React.ReactElement => (
  <Stack
    direction={{ xs: "column", md: "row" }}
    gap={SETTINGS_ZONE_GAP}
    alignItems="flex-start"
    sx={{ maxWidth, mx: "auto", width: "100%" }}
  >
    {preview && (
      <Box
        sx={{
          position: { xs: "sticky", md: "static" },
          // Offset per no quedar sota l'AppBar fix del diàleg en mòbil
          top: { xs: SETTINGS_APPBAR_OFFSET, md: 0 },
          zIndex: { xs: 10, md: "auto" },
          // Acotem la mostra perquè no es mengi la pantalla i deixi els controls fora de vista
          maxHeight: { xs: "35vh", md: "none" },
          overflow: { xs: "auto", md: "visible" },
        }}
      >
        {preview}
      </Box>
    )}

    <Stack flex={1} gap={controlsGap} sx={{ width: "100%" }}>
      {children}
    </Stack>
  </Stack>
);

export default SettingsPanelLayout;
