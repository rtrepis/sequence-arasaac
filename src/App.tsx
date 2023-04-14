import "./App.css";
import { useAppSelector } from "./app/hooks";
import BarNavigation from "./components/BarNavigation/BarNavigation";
import EditSequencesPages from "./pages/EditSequencesPages/EditSequencesPages";
import ViewSequencePage from "./pages/ViewSequencePages/ViewSequencePage";

const App = (): JSX.Element => {
  const { viewPage } = useAppSelector((state) => state.ui);

  return (
    <BarNavigation>
      <>
        {!viewPage && <EditSequencesPages />}
        {viewPage && <ViewSequencePage />}
      </>
    </BarNavigation>
  );
};

export default App;
