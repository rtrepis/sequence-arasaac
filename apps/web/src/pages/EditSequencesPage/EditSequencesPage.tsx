import { Divider, Stack, Typography } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "../../components/MagicSearch/MagicSearch";
import React, { useEffect, useState } from "react";
import TabsSequences from "../../components/TabsSequences/TabsSequences";
import { FeedbackProgress } from "@/context/FeedbackContext";
import { FormattedMessage } from "react-intl";
import { useAppSelector } from "../../app/hooks";
import useSearchPictogram from "../../features/pictogram/hooks/useSearchPictogram";
import { messages } from "./EditSequencesPage.lang";

const EditSequencesPage = (): React.ReactElement => {
  const [info, setInfo] = useState(false);
  const keywords = useAppSelector((state) => state.ui.lang.keywords);
  const { getAllKeyWordsForLanguages } = useSearchPictogram();

  // Carrega les paraules clau de l'ARASAAC la primera vegada que s'obre l'editor
  useEffect(() => {
    if (keywords.length === 0) getAllKeyWordsForLanguages();
  }, []);

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
