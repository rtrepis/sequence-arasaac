import { Stack } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import "./App.css";
import { RootState } from "./app/store";
import PictogramAmount from "./components/PictogramAmount/PictogramAmount";
import BarNavigation from "./components/BarNavigation/BarNavigation";
import PictEditList from "./components/PictEditList/PictEditList";

const App = () => {
  const sequence = useSelector((state: RootState) => state.sequence);

  return (
    <>
      <BarNavigation>
        <>
          <Stack direction={"column"} marginTop={2}>
            <PictogramAmount />
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
