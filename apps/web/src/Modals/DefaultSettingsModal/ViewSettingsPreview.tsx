import { Box } from "@mui/material";
import { ViewSettings } from "../../types/ui";
import { createPageFormat } from "../../types/PageFormat";
import { useAppSelector } from "../../app/hooks";
import { SettingsPreviewFrame } from "../../components/SettingsLayout";
import { ALIGN_H, ALIGN_V } from "../../shared/constants/alignmentMaps";
import React, { useMemo } from "react";

interface ViewSettingsPreviewProps {
  settings: ViewSettings;
}

const PREVIEW_WIDTH = 260;
const PREVIEW_BORDER = 1;
const SEQUENCES = 3;
const PICTS_PER_SEQUENCE = 6;

const ViewSettingsPreview = ({ settings }: ViewSettingsPreviewProps): React.ReactElement => {
  // Mateixa fórmula que PictogramCard.styled.ts: amb vora, la targeta és més ampla
  const borderOutSize = useAppSelector(
    (state) => state.ui.defaultSettings.pictSequence.borderOut.size,
  );
  const basePictPx = borderOutSize === 0 ? 150 : 180 + borderOutSize;

  const pageFormat = useMemo(
    () => createPageFormat(settings.pageSize, settings.orientation),
    [settings.pageSize, settings.orientation],
  );

  const { width: pageWidth, height: pageHeight } = pageFormat.dimensions;
  // Descomptem la vora del frame perquè el contingut no quedi retallat
  const previewScale = (PREVIEW_WIDTH - 2 * PREVIEW_BORDER) / pageWidth;
  const previewHeight = Math.round(pageHeight * previewScale);

  // Mides reals dins el contenidor intern (es reduiran amb el transform)
  const pictSizePx = basePictPx * settings.sizePict;
  // Gap en unitats MUI spacing (×8px), igual que columnGap/rowGap a ViewSequencePage.tsx
  const pictGapMui = settings.pictSpaceBetween * settings.sizePict;
  const isRow = settings.direction === "row";
  // Eix principal: alineació per seqüència (H si row, V si column) — ja funcionava
  const justifyContent = isRow ? ALIGN_H[settings.alignmentH] : ALIGN_V[settings.alignmentV];
  // Eix creuat: alineació de bloc, aplicada al contenidor exterior (tot el conjunt de seqüències)
  const blockAlign = isRow ? ALIGN_V[settings.alignmentV] : ALIGN_H[settings.alignmentH];

  const sequence = (
    <Box
      display="flex"
      flexDirection={isRow ? "row" : "column"}
      flexWrap="wrap"
      justifyContent={justifyContent}
      gap={pictGapMui}
      flexShrink={0}
      width={isRow ? "100%" : "auto"}
      height={isRow ? "auto" : "100%"}
    >
      {Array.from({ length: PICTS_PER_SEQUENCE }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: pictSizePx,
            height: pictSizePx,
            borderRadius: "4px",
            bgcolor: "primary.light",
            opacity: 0.8,
            flexShrink: 0,
          }}
        />
      ))}
    </Box>
  );

  return (
    <SettingsPreviewFrame
      background="default"
      sx={{
        width: PREVIEW_WIDTH,
        height: previewHeight,
        flexShrink: 0,
        transition: "height 0.2s ease",
        position: "relative",
      }}
    >
      {/* Contenidor intern a mida real → el transform l'escala al PREVIEW_WIDTH */}
      <Box
        sx={{
          width: pageWidth,
          height: pageHeight,
          transform: `scale(${previewScale})`,
          transformOrigin: "top left",
          display: "flex",
          flexDirection: settings.direction,
          flexWrap: "wrap",
          alignContent: blockAlign,
          alignItems: blockAlign,
          // Mateixa lògica de gap que ViewSquenceSettings.tsx
          columnGap: isRow ? 0 : settings.sequenceSpaceBetween,
          rowGap: isRow ? settings.sequenceSpaceBetween : 0,
          padding: "16px 12px",
        }}
      >
        {Array.from({ length: SEQUENCES }).map((_, i) => (
          <React.Fragment key={i}>{sequence}</React.Fragment>
        ))}
      </Box>
    </SettingsPreviewFrame>
  );
};

export default ViewSettingsPreview;
