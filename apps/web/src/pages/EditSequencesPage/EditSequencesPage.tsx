import { Divider, Stack, Typography } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "@features/pictogram/components/MagicSearch";
import React, { useState } from "react";
import TabsSequences from "../../components/TabsSequences/TabsSequences";
import { FeedbackProgress } from "@/context/FeedbackContext";
import { FormattedMessage } from "react-intl";
import useArasaacKeywords from "../../features/pictogram/hooks/useArasaacKeywords";
import { messages } from "./EditSequencesPage.lang";
import EditBottomBar from "@features/sequence/components/EditBottomBar/EditBottomBar";
import EditLayoutSwitch from "@features/sequence/components/EditLayoutSwitch/EditLayoutSwitch";
import useEditLayout from "@features/sequence/hooks/useEditLayout";

const EditSequencesPage = (): React.ReactElement => {
  const [info, setInfo] = useState(false);
  const { isNew, canChoose, choose } = useEditLayout();

  // Manté les paraules clau de l'ARASAAC sincronitzades amb l'idioma de cerca
  useArasaacKeywords();

  const toggleValue = () => {
    setInfo((previous) => !previous);
  };
  // La pantalla nova (pas 8 del pla dels estils): la capçalera de la
  // seqüència, la graella i la barra de baix. Al mòbil sempre; a l'escriptori,
  // si l'usuari la tria, amb el botó per tornar a la d'abans (pas 10)
  if (isNew)
    return (
      <>
        {canChoose && (
          <Stack direction="row" justifyContent="flex-end" marginBlockEnd={1}>
            <EditLayoutSwitch current="new" onChoose={choose} />
          </Stack>
        )}
        <FeedbackProgress />
        <TabsSequences newLayout />
        <EditBottomBar />
      </>
    );

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
        {/* A l'escriptori, la pantalla nova es prova d'aquí (pas 10) */}
        {canChoose && (
          <Stack justifyContent="flex-start" flexShrink={0}>
            <EditLayoutSwitch current="classic" onChoose={choose} />
          </Stack>
        )}
      </Stack>
      <Divider />
      <FeedbackProgress />
      <Stack
        direction={{ xs: "row", md: "column" }}
        alignItems={{ xs: "center", md: "stretch" }}
        flexWrap="wrap"
      >
        {/* Etiqueta de la tira de seqüències. En verd es quedava a 2,1:1 sobre
            el full; en gris fa de rètol, que és el que és */}
        <Typography
          color="text.secondary"
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
