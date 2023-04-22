import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import BarNavigation from "../../components/BarNavigation/BarNavigation";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSequencesSettings";
import { ViewSettings } from "../../types/ui";

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

  return (
    <BarNavigation title="view">
      <>
        <ViewSequencesSettings view={view} setView={setView}>
          {sequence.map((pictogram) => (
            <PictogramCard
              pictogram={pictogram}
              view={"complete"}
              variant="plane"
              size={view.sizePict}
              key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
            />
          ))}
        </ViewSequencesSettings>
      </>
    </BarNavigation>
  );
};

export default ViewSequencePage;
