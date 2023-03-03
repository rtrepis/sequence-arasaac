import React from "react";
import "./App.css";
import PictogramCardList from "./app/components/PictogramCardList/PictogramCardList";
import { SequenceI } from "./app/types/sequence";

const sequence: SequenceI = [
  { index: 0, number: 2333, border: "none" },
  { index: 1, number: 2333, border: "none" },
  { index: 2, number: 2333, border: "none" },
  { index: 3, number: 2333, border: "none" },
  { index: 4, number: 2333, border: "none" },
  { index: 5, number: 2333, border: "none" },
  { index: 6, number: 2333, border: "none" },
  { index: 7, number: 2333, border: "none" },
  { index: 8, number: 2333, border: "none" },
];

const App = () => {
  return (
    <>
      <h1 className="App">Sequence - AraSaac</h1>
      <PictogramCardList sequence={sequence} />
    </>
  );
};

export default App;
