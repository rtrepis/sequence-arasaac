import { Stack } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import "./App.css";
import { RootState } from "./app/store";
import PictogramCardList from "./components/PictogramCardList/PictogramCardList";
import SequenceCreate from "./components/SequenceCreate/SequenceCreate";

const App = () => {
  const sequence = useSelector((state: RootState) => state.sequence);

  return (
    <Stack alignContent={"center"}>
      <h1 className="App">Sequence - AraSaac</h1>
      <SequenceCreate />
      <PictogramCardList sequence={sequence} />
    </Stack>
  );
};

export default App;
