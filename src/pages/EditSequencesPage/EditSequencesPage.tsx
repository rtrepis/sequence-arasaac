import { Divider, Stack, Typography } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "../../components/MagicSearch/MagicSearch";
import React, { useState } from "react";
import TabsSequences from "../../components/TabsSequences/TabsSequences";
import { FeedbackProgress } from "@/context/FeedbackContext";
import { FormattedMessage } from "react-intl";

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
      <Divider />
      <div>
        <Typography color={"primary"}>Seqüencies</Typography>
        <FeedbackProgress />
      </div>
      <TabsSequences />
    </>
  );
};

export default EditSequencesPage;
