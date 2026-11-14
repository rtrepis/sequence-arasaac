import { Box, Chip, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import React, { useMemo } from "react";
import type { SequenceViewSettings } from "@/types/document";
import { ViewSettings } from "@/types/ui";
import {
  PAPER_DIMENSIONS_MM,
  PRINT_MARGIN_MM,
} from "@features/print/utils/pageFormat";
import { pixelsToMM } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import { SettingsPreviewFrame } from "@components/SettingsLayout";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import {
  previewSequenceColors,
  printColors,
  sheetGuide,
} from "@/style/palette";
import { sheetAreaMm } from "@features/free-layout/model/placement";
import { initialPagesFor } from "@features/free-layout/model/pages";
import {
  FALLBACK_CARD_PX,
  SPACE_UNIT_PX,
  blockGrid,
  resolveColumns,
} from "@features/free-layout/model/blockGrid";
import {
  fitSheetBlocks,
  naturalBoxMm,
} from "@features/free-layout/model/naturalBox";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";

/** Quants pictogrames té cada seqüència de la mostra. */
export const PREVIEW_SEQUENCE_LENGTHS = [4, 5, 6] as const;

interface ViewSettingsPreviewProps {
  settings: ViewSettings;
  /** Les seqüències de la mostra que es veuen (les caselles del costat) */
  shown: readonly boolean[];
}

const PREVIEW_WIDTH = 260;

/** Una targeta de la mostra: el color de la seva seqüència i el seu número. */
const PreviewCard = ({
  sequence,
  number,
  w,
  h,
}: {
  sequence: number;
  number: number;
  w: number;
  h: number;
}): React.ReactElement => (
  <Box
    sx={{
      width: w,
      height: h,
      flexShrink: 0,
      borderRadius: `${Math.max(1, w * 0.08)}px`,
      backgroundColor: previewSequenceColors[sequence],
      color: printColors.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.max(5, Math.min(w, h) * 0.45),
      fontWeight: "bold",
      lineHeight: 1,
    }}
  >
    {number}
  </Box>
);

/**
 * La mostra del panell «Pàgina i distribució» (pas 7c): un full amb tres
 * seqüències de colors diferents (de 4, 5 i 6 pictogrames, numerats), tal com
 * començaria un document nou. A dalt, l'etiqueta de la disposició, la mateixa
 * que a la capçalera de la pàgina de la vista. En columnes, files o lliure, els
 * blocs els fa el mateix model que les pàgines de debò (`initialPagesFor`, i
 * `fitSheetBlocks` en lliure), amb el requadre de cada bloc.
 */
const ViewSettingsPreview = ({
  settings,
  shown,
}: ViewSettingsPreviewProps): React.ReactElement => {
  const intl = useIntl();
  const disposition = settings.disposition ?? "auto";
  const keys = PREVIEW_SEQUENCE_LENGTHS.map((_, index) => index).filter(
    (index) => shown[index],
  );
  const counts: Record<number, number> = Object.fromEntries(
    PREVIEW_SEQUENCE_LENGTHS.map((length, index) => [index, length]),
  );

  // El full, en mm, a l'amplada de la mostra
  const paperSize =
    settings.pageSize === "FULLSCREEN" ? "A4" : settings.pageSize;
  const paper = PAPER_DIMENSIONS_MM[paperSize];
  const [paperW, paperH] =
    settings.orientation === "landscape"
      ? [paper.height, paper.width]
      : [paper.width, paper.height];
  const k = (PREVIEW_WIDTH - 2) / paperW;
  const area = sheetAreaMm(paperSize, settings.orientation);
  const view: SequenceViewSettings = {
    sizePict: settings.sizePict,
    pictSpaceBetween: settings.pictSpaceBetween,
    alignmentH: settings.alignmentH,
    alignmentV: settings.alignmentV,
  };
  // La targeta de reserva, a mida 1, en mm
  const cardMm = {
    w: pixelsToMM(FALLBACK_CARD_PX.w, CSS_PRINT_DPI),
    h: pixelsToMM(FALLBACK_CARD_PX.h, CSS_PRINT_DPI),
  };
  const gapMm = pixelsToMM(
    Math.max(0, settings.pictSpaceBetween) * SPACE_UNIT_PX,
    CSS_PRINT_DPI,
  );

  const blocks = useMemo(() => {
    if (disposition === "auto" || !area || keys.length === 0) return null;
    let count = 0;
    const context = {
      area,
      direction: settings.direction,
      newId: (prefix: string) => `${prefix}_${(count += 1)}`,
    };
    const pages = initialPagesFor(disposition, keys, context);
    if (!pages) return null;
    const fitted =
      disposition === "free"
        ? fitSheetBlocks(
            pages,
            0,
            (placement) =>
              naturalBoxMm({
                count: counts[placement.sequenceKey],
                card: FALLBACK_CARD_PX,
                view,
                columns: placement.columns,
                area,
              }),
            area,
          )
        : pages;
    return fitted.sheets[0].placements.flatMap((placement) =>
      placement.kind === "sequence" ? [placement] : [],
    );
    // `keys`, `counts` i `view` es tornen a fer a cada pintada a partir de
    // `shown` i `settings`, que són les dependències de debò
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disposition, settings, shown, area?.w, area?.h]);

  const tag =
    disposition === "auto"
      ? { kind: "continuous", n: 0, name: "" }
      : disposition === "free"
        ? { kind: "free", n: 0, name: "" }
        : { kind: disposition, n: Math.max(1, keys.length), name: "" };

  // Pàgina simple: les seqüències una darrere l'altra, com a la vista
  const isRow = settings.direction === "row";
  const simple = (
    <Box
      sx={{
        position: "absolute",
        inset: PRINT_MARGIN_MM * k,
        display: "flex",
        flexDirection: settings.direction,
        flexWrap: "wrap",
        // «safe»: si no hi cap, es retalla per baix i no per dalt
        alignContent: `safe ${
          isRow ? ALIGN_V[settings.alignmentV] : ALIGN_H[settings.alignmentH]
        }`,
        gap: `${pixelsToMM(settings.sequenceSpaceBetween * SPACE_UNIT_PX, CSS_PRINT_DPI) * k}px`,
      }}
    >
      {keys.map((sequence) => (
        <Box
          key={sequence}
          sx={{
            display: "flex",
            flexDirection: settings.direction,
            flexWrap: "wrap",
            justifyContent: isRow
              ? ALIGN_H[settings.alignmentH]
              : ALIGN_V[settings.alignmentV],
            gap: `${gapMm * settings.sizePict * k}px`,
            width: isRow ? "100%" : "auto",
          }}
        >
          {Array.from({ length: counts[sequence] }, (_, index) => (
            <PreviewCard
              key={index}
              sequence={sequence}
              number={index + 1}
              w={cardMm.w * settings.sizePict * k}
              h={cardMm.h * settings.sizePict * k}
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  return (
    <Stack spacing={1} sx={{ width: PREVIEW_WIDTH }}>
      {/* A la dreta, com a la capçalera de la pàgina de la vista */}
      <Chip
        label={intl.formatMessage(pageMessages.arrangementTag, tag)}
        size="small"
        variant="outlined"
        sx={{ alignSelf: "flex-end" }}
      />
      <SettingsPreviewFrame
        background="default"
        sx={{
          width: PREVIEW_WIDTH,
          height: Math.round(paperH * k) + 2,
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
          transition: "height 0.2s ease",
        }}
      >
        {!blocks
          ? simple
          : blocks.map((placement) => {
              const count = counts[placement.sequenceKey];
              const { grid, gapPx } = blockGrid({
                count,
                card: FALLBACK_CARD_PX,
                view,
                box: { w: placement.w, h: placement.h },
                columns: resolveColumns(
                  placement.columns,
                  disposition === "columns" || disposition === "rows"
                    ? disposition
                    : undefined,
                  count,
                ),
              });
              return (
                <Box
                  key={placement.id}
                  sx={{
                    position: "absolute",
                    left: (PRINT_MARGIN_MM + placement.x) * k,
                    top: (PRINT_MARGIN_MM + placement.y) * k,
                    width: placement.w * k,
                    height: placement.h * k,
                    border: `1px dashed ${sheetGuide}`,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: ALIGN_V[settings.alignmentV],
                    justifyContent: ALIGN_H[settings.alignmentH],
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.max(1, grid.columns)}, auto)`,
                      gap: `${pixelsToMM(gapPx, CSS_PRINT_DPI) * k}px`,
                    }}
                  >
                    {Array.from({ length: count }, (_, index) => (
                      <PreviewCard
                        key={index}
                        sequence={placement.sequenceKey}
                        number={index + 1}
                        w={cardMm.w * grid.size * k}
                        h={cardMm.h * grid.size * k}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
      </SettingsPreviewFrame>
    </Stack>
  );
};

export default ViewSettingsPreview;
