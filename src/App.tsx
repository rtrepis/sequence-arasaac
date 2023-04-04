import "./App.css";
import { useAppSelector } from "./app/hooks";
import BarNavigation from "./components/BarNavigation/BarNavigation";
import EditSequencesPages from "./pages/EditSequncesPages/EditSequencesPages";
import ViewSequencePage from "./pages/ViewSequencePages/ViewSequencePage";

const App = () => {
  const { view } = useAppSelector((state) => state.ui);

  return (
    <>
      <BarNavigation>
        <>
          {!view && <EditSequencesPages />}
          {view && <ViewSequencePage />}
        </>
      </BarNavigation>
    </>
  );
};

export default App;
