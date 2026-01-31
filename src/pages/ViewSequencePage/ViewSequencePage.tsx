import { useState } from "react";
import { useAppSelector } from "@/app/hooks";
import PictogramCard from "@/components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "@/components/ViewSequencesSettings/ViewSquenceSettings.refactor";
import { ViewSettings } from "@/types/ui";
import CopyRight from "@/components/CopyRight/CopyRight";
import React from "react";
import { Box } from "@mui/material";

const ViewSequencePage = (): React.ReactElement => {
  const {
    document,
    ui: { viewSettings },
  } = useAppSelector((state) => state);

  const initialViewState: ViewSettings = {
    sizePict: viewSettings.sizePict,
    columnGap: viewSettings.columnGap,
    rowGap: viewSettings.rowGap,
  };
  const [view, setView] = useState(initialViewState);

  const initialAuthor: string = "";
  const [author, setAuthor] = useState(initialAuthor);

  const initialScale = 1;
  const [scale, setScale] = useState(initialScale);

  return (
    <>
      <ViewSequencesSettings>
        {Object.entries(document.content).map(([key, sequence]) => (
          <Box
            key={`sequence-${key}`}
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignContent: "start",
              alignItems: "start",
              columnGap: view.columnGap * scale,
              rowGap: view.rowGap * scale,
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
                  pictSize: view.sizePict,
                  scale: scale,
                }}
                key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
              />
            ))}
          </Box>
        ))}
      </ViewSequencesSettings>
      <CopyRight author={author} />
    </>
  );
};

export default ViewSequencePage;
