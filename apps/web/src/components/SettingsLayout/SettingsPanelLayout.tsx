import { Box, Stack } from "@mui/material";
import React from "react";
import {
  SETTINGS_ROW_GAP,
  SETTINGS_ZONE_GAP,
  SETTINGS_MAX_WIDTH,
  SETTINGS_APPBAR_OFFSET,
  SETTINGS_PREVIEW_STICKY_TOP,
  SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT,
} from "./settingsLayout.styled";

interface SettingsPanelLayoutProps {
  /** Contingut de la previsualització (ja embolcallat amb SettingsPreviewFrame). Opcional. */
  preview?: React.ReactNode;
  /**
   * Contingut que acompanya la mostra a la columna esquerra però que no és
   * mostra (llistes llargues, com el vocabulari desat). Queda en flux normal:
   * no s'enganxa ni comparteix el límit d'alçada de la mostra.
   */
  previewAside?: React.ReactNode;
  /** Columna de controls (files d'ajustos). */
  children: React.ReactNode;
  /** Amplada màxima del panell centrat. Per defecte SETTINGS_MAX_WIDTH (estàndard tauleta). */
  maxWidth?: number;
  /** Separació vertical entre files de la columna de controls. Per defecte SETTINGS_ROW_GAP. */
  controlsGap?: number;
}

/**
 * Layout canònic de dues zones d'un tab de configuracions:
 * previsualització a l'esquerra (sticky) + columna de controls a la dreta.
 * Si no es passa `preview`, la columna de controls s'ocupa sola i queda centrada.
 */
const SettingsPanelLayout = ({
  preview,
  previewAside,
  children,
  maxWidth = SETTINGS_MAX_WIDTH,
  controlsGap = SETTINGS_ROW_GAP,
}: SettingsPanelLayoutProps): React.ReactElement => {
  // Amb llista acompanyant, la sticky baixa un nivell: s'enganxa la mostra sola
  // i la llista es queda en flux, sense límit d'alçada ni scroll intern
  const hasAside = previewAside !== undefined;
  const desktopMaxHeight = `calc(100vh - ${SETTINGS_PREVIEW_STICKY_TOP * 2}px)`;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      gap={SETTINGS_ZONE_GAP}
      alignItems="flex-start"
      sx={{ maxWidth, mx: "auto", width: "100%" }}
    >
      {(preview || previewAside) && (
        <Stack
          gap={1}
          sx={{
            // En mòbil la zona ocupa tota l'amplada del panell: si s'ajustés al
            // contingut quedaria arrambada a l'esquerra pel alignItems del pare
            width: { xs: "100%", md: "auto" },
            // Sticky perquè la mostra segueixi visible mentre s'ajusten els
            // controls; en mòbil, amb llista, l'enganxada la fa el fill
            position: hasAside ? { xs: "static", md: "sticky" } : "sticky",
            // En mòbil, offset per no quedar sota l'AppBar fix del diàleg;
            // per sobre de md l'AppBar marxa amb l'scroll i només cal aire
            top: {
              xs: SETTINGS_APPBAR_OFFSET,
              md: SETTINGS_PREVIEW_STICKY_TOP,
            },
            // Acotem la mostra perquè no es mengi la pantalla; amb llista no
            // cal: el que sobresurt es llegeix fent scroll a la pàgina
            maxHeight: hasAside
              ? { md: desktopMaxHeight }
              : {
                  xs: SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT,
                  md: desktopMaxHeight,
                },
            overflow: hasAside ? { xs: "visible", md: "auto" } : "auto",
            zIndex: 10,
            // Opaca: mentre és sticky, els controls li passen per sota
            bgcolor: "background.paper",
          }}
        >
          {preview && (
            <Box
              sx={{
                position: hasAside ? { xs: "sticky", md: "static" } : "static",
                top: SETTINGS_APPBAR_OFFSET,
                zIndex: 10,
                bgcolor: "background.paper",
                paddingBottom: hasAside ? { xs: 1, md: 0 } : 0,
                // Amplada completa en mòbil (perquè el fons tapi el que passa
                // per sota) amb la mostra centrada a dins
                width: { xs: "100%", md: "auto" },
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {preview}
            </Box>
          )}

          {previewAside}
        </Stack>
      )}

      <Stack flex={1} gap={controlsGap} sx={{ width: "100%", minWidth: 0 }}>
        {children}
      </Stack>
    </Stack>
  );
};

export default SettingsPanelLayout;
