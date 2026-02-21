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
              sizePict: 0.9,
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
                    viewSettings.direction === "row" ? "row" : "column",
                  alignContent: "start",
                  alignItems: "start",
                  justifyContent:
                    ALIGNMENT_TO_JUSTIFY[seqView.alignment] ?? "flex-start",
                  columnGap: seqView.pictSpaceBetween * scale,
                  rowGap: seqView.pictSpaceBetween * scale,
                  height: viewSettings.direction === "column" ? "100%" : "auto",
                  width: viewSettings.direction === "row" ? "100%" : "auto",
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
