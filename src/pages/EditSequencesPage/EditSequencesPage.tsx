import { Stack } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "../../components/MagicSearch/MagicSearch";
import { useAppSelector } from "../../app/hooks";
import PictEditModalList from "../../Modals/PictEditModalList/PictEditModalList";
import React, { useState } from "react";

const EditSequencesPage = (): React.ReactElement => {
  const sequence = useAppSelector((state) => state.sequence);
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
      <PictEditModalList sequence={sequence} />
    </>
  );
};

export default EditSequencesPage;
