import BarNavigation from "../../components/BarNavigation/BarNavigation";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSequencesSettings";

const EditSequencesPages = (): JSX.Element => {
  return (
    <BarNavigation title="view">
      <>
        <ViewSequencesSettings />
      </>
    </BarNavigation>
  );
};

export default EditSequencesPages;
