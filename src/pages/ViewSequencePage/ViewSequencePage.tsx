import React from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings, {
  ALIGNMENT_TO_JUSTIFY,
} from "../../components/ViewSequencesSettings/ViewSquenceSettings";
import CopyRight from "../../components/CopyRight/CopyRight";

/**
 * Pàgina de visualització de seqüències refactoritzada
 * sizePict, pictSpaceBetween i alignment són per seqüència; sequenceSpaceBetween és global
 */
const ViewSequencePage = (): React.ReactElement => {
  const { document } = useAppSelector((state) => state);

  return (
    <ViewSequencesSettings>
      {({ viewSettings, sequenceViewSettings, scale, author }) => (
        <>
          {Object.entries(document.content).map(([key, sequence]) => {
            const seqKey = Number(key);
            const seqView = sequenceViewSettings[seqKey] ?? {
              sizePict: 1,
              pictSpaceBetween: 1,
              alignment: "left" as const,
            };

            return (
              <Box
                key={`sequence-${key}`}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection:
                    viewSettings.direction === "column" ? "row" : "column",
                  alignContent: "start",
                  alignItems: "start",
                  justifyContent:
                    ALIGNMENT_TO_JUSTIFY[seqView.alignment] ?? "flex-start",
                  columnGap:
                    viewSettings.direction === "column"
                      ? seqView.pictSpaceBetween * scale
                      : 0,
                  rowGap: seqView.pictSpaceBetween * scale,
                  height: viewSettings.direction === "column" ? "auto" : "100%",
                }}
              >
                {sequence.map((pictogram) => (
                  <PictogramCard
                    pictogram={pictogram}
                    view={"complete"}
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
