import { Stack } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import "./App.css";
import { RootState } from "./app/store";
import PictogramAmount from "./components/PictogramAmount/PictogramAmount";
import PictogramCardList from "./components/PictogramCardList/PictogramCardList";

const App = () => {
  const sequence = useSelector((state: RootState) => state.sequence);

  return (
    <Stack alignContent={"center"}>
      <h1 className="App">Sequence - AraSaac</h1>
      <PictogramAmount />
      <PictogramCardList sequence={sequence} />
    </Stack>
  );
};

export default App;
