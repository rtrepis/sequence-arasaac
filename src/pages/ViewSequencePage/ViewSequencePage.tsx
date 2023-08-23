import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import BarNavigation from "../../components/BarNavigation/BarNavigation";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSequencesSettings";
import { ViewSettings } from "../../types/ui";
import CopyRight from "../../components/CopyRight/CopyRight";

const ViewSequencePage = (): JSX.Element => {
  const {
    sequence,
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
    <BarNavigation title="view">
      <>
        <ViewSequencesSettings
          view={view}
          setView={setView}
          author={author}
          setAuthor={setAuthor}
          scale={scale}
          setScale={setScale}
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
        </ViewSequencesSettings>
        <CopyRight author={author} />
      </>
    </BarNavigation>
  );
};

export default ViewSequencePage;
