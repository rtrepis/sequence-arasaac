import { Divider, Stack, Typography } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "@features/pictogram/components/MagicSearch";
import React, { useState } from "react";
import TabsSequences from "../../components/TabsSequences/TabsSequences";
import { FeedbackProgress } from "@/context/FeedbackContext";
import { FormattedMessage } from "react-intl";
import useArasaacKeywords from "../../features/pictogram/hooks/useArasaacKeywords";
import { messages } from "./EditSequencesPage.lang";

const EditSequencesPage = (): React.ReactElement => {
  const [info, setInfo] = useState(false);

  // Manté les paraules clau de l'ARASAAC sincronitzades amb l'idioma de cerca
  useArasaacKeywords();

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
        <MagicSearch showHelperText={info} />
      </Stack>
      <Divider />
      <FeedbackProgress />
      <Stack
        direction={{ xs: "row", md: "column" }}
        alignItems={{ xs: "center", md: "stretch" }}
        flexWrap="wrap"
      >
        <Typography
          color="primary"
          sx={{ whiteSpace: "nowrap", mr: { xs: 1, md: 0 } }}
        >
          <FormattedMessage {...messages.sequences} />
        </Typography>
        <TabsSequences />
      </Stack>
    </>
  );
};

export default EditSequencesPage;
