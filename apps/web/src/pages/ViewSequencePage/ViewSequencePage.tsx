import React from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSquenceSettings";
import CopyRight from "../../components/CopyRight/CopyRight";
import { PictogramCardDefaults } from "../../types/sequence";
import { ALIGN_H, ALIGN_V } from "../../shared/constants/alignmentMaps";

/**
 * Pàgina de visualització de seqüències
 * alignmentH i alignmentV són independents i sempre signifiquen H i V
 * independentment de la direcció de la seqüència
 */
const ViewSequencePage = (): React.ReactElement => {
  const { document, ui } = useAppSelector((state) => state);
  const { pictSequence } = ui.defaultSettings;
  const defaults: PictogramCardDefaults = {
    numbered: pictSequence.numbered,
    font: pictSequence.font,
    numberFont: pictSequence.numberFont,
    borderIn: pictSequence.borderIn,
    borderOut: pictSequence.borderOut,
  };

  return (
    <ViewSequencesSettings>
      {({ viewSettings, sequenceViewSettings, scale, author }) => (
        <>
          {Object.entries(document.content).map(([key, sequence]) => {
            const seqKey = Number(key);
            const seqView = sequenceViewSettings[seqKey] ?? {
              sizePict: 0.9,
              pictSpaceBetween: 1,
              alignmentH: "left" as const,
              alignmentV: "top" as const,
            };

            const isRow = viewSettings.direction === "row";
            const justifyContent = isRow
              ? ALIGN_H[seqView.alignmentH]
              : ALIGN_V[seqView.alignmentV];

            return (
              <Box
                key={`sequence-${key}`}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: isRow ? "row" : "column",
                  justifyContent,
                  columnGap: seqView.pictSpaceBetween * scale * seqView.sizePict,
                  rowGap: seqView.pictSpaceBetween * scale * seqView.sizePict,
                  height: isRow ? "auto" : "100%",
                  width: isRow ? "100%" : "auto",
                }}
              >
                {sequence.map((pictogram) => (
                  <PictogramCard
                    pictogram={pictogram}
                    view={"complete"}
                    defaults={defaults}
                    variant="plane"
                    size={{
                      pictSize: seqView.sizePict,
                      scale: scale,
                    }}
                    key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
                  />
                ))}
              </Box>
            );
          })}
          <CopyRight author={author} />
        </>
      )}
    </ViewSequencesSettings>
  );
};

export default ViewSequencePage;
