import React from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSquenceSettings.refactor";
import CopyRight from "../../components/CopyRight/CopyRight";

/**
 * Pàgina de visualització de seqüències refactoritzada
 * Ara rep els paràmetres de size del ViewSequencesSettings via children render prop
 */
const ViewSequencePage = (): React.ReactElement => {
  const { document } = useAppSelector((state) => state);

  return (
    <ViewSequencesSettings>
      {({ viewSettings, scale, author }) => (
        <>
          {Object.entries(document.content).map(([key, sequence]) => (
            <Box
              key={`sequence-${key}`}
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignContent: "start",
                alignItems: "start",
                columnGap: viewSettings.columnGap * scale,
                rowGap: viewSettings.rowGap * scale,
                width: "100%",
                marginBottom: 2,
              }}
            >
              {sequence.map((pictogram) => (
                <PictogramCard
                  pictogram={pictogram}
                  view={"complete"}
                  variant="plane"
                  size={{
                    pictSize: viewSettings.sizePict,
                    scale: scale,
                  }}
                  key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
                />
              ))}
            </Box>
          ))}
          <CopyRight author={author} />
        </>
      )}
    </ViewSequencesSettings>
  );
};

export default ViewSequencePage;
