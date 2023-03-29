import { Stack } from "@mui/system";
import { useSelector } from "react-redux";
import "./App.css";
import { RootState } from "./app/store";
import PictogramAmount from "./components/PictogramAmount/PictogramAmount";
import BarNavigation from "./components/BarNavigation/BarNavigation";
import PictEditList from "./components/PictEditList/PictEditList";
import MagicSearch from "./components/MagicSearch/MagicSearch";

const App = () => {
  const sequence = useSelector((state: RootState) => state.sequence);

  return (
    <>
      <BarNavigation>
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            marginTop={2}
            justifyContent={"space-around"}
          >
            <PictogramAmount />
            <MagicSearch />
          </Stack>
          <Stack alignItems={"center"}>
            <PictEditList sequence={sequence} />
          </Stack>
        </>
      </BarNavigation>
    </>
  );
};

export default App;
