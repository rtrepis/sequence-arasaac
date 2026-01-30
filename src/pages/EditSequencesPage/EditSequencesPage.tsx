import { Stack } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "../../components/MagicSearch/MagicSearch";
import React, { useState } from "react";
import TabsSequences from "../../components/TabsSequences/TabsSequences";

const EditSequencesPage = (): React.ReactElement => {
  const [info, setInfo] = useState(false);

  const toggleValue = () => {
    setInfo((previous) => !previous);
  };
  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent={"space-around"}
        marginBlockEnd={1}
      >
        <PictogramAmount info={{ value: info, toggleValue: toggleValue }} />
        <MagicSearch info={{ value: info }} />
      </Stack>
      <TabsSequences />
    </>
  );
};

export default EditSequencesPage;
