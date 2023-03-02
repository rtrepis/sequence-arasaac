import React from "react";
import "./App.css";
import PictogramShow from "./app/components/PictogramShow/PictogramShow";

const App = () => {
  return (
    <>
      <h1 className="App">Sequence - AraSaac</h1>
      <PictogramShow
        index={1}
        view={"complete"}
        borderOut={{ size: 0, radius: 20 }}
        borderIn={{ size: 2, radius: 20 }}
      />
    </>
  );
};

export default App;
