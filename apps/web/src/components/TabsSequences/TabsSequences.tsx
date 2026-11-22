import {
  Tab,
  Tabs,
  Tooltip,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { SyntheticEvent } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { changeActiveSAACActionCreator } from "@features/sequence/store/documentSlice";
import { addNewSequenceThunk } from "@features/free-layout/store/freeLayoutThunks";
import { BsFileEarmarkPlus } from "react-icons/bs";
import StyledIconButton from "@/style/StyledIconButton";
import { useIntl } from "react-intl";
import messages from "./TabsSequences.lang";
import SequenceHeader from "@features/sequence/components/SequenceHeader/SequenceHeader";

const TabsSequences = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const value = useAppSelector((state) => state.document.activeSAAC);
  // Nombre de tabs derivat de les claus de content (estat persistat en Redux)
  const amount = useAppSelector(
    (state) => Object.keys(state.document.content).length,
  );

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    dispatch(changeActiveSAACActionCreator(newValue));
  };

  const handleAddSequence = () => {
    // Va a l'última pàgina, segons la seva disposició
    dispatch(addNewSequenceThunk(amount));
    dispatch(changeActiveSAACActionCreator(amount));
  };

  /**
   * El número de la seqüència activa el diu la tinta del tema, no el verd: com a
   * color de text, el verd de la casa es queda a 2,1:1 sobre el full. El verd es
   * queda a la barra de l'indicador, que és decoració i no l'única senyal.
   */
  const sequenceTabsSx = {
    "& .MuiTab-root": { color: "text.secondary" },
    "& .MuiTab-root.Mui-selected": { color: "text.primary" },
  };

  const tabs = [...Array(amount)].map((_, index) => (
    <Tab
      key={`tab-${index}`}
      label={`${index + 1}`}
      id={`vertical-tab-${index}`}
      aria-controls={`vertical-tabpanel-${index}`}
      sx={isMobile ? { minHeight: 36, minWidth: 40 } : undefined}
    />
  ));

  const addButton = (
    <Tooltip title={intl.formatMessage(messages.addSequence)}>
      <span>
        <StyledIconButton
          color="inherit"
          onClick={handleAddSequence}
          size="small"
          aria-label={intl.formatMessage(messages.addSequence)}
        >
          <BsFileEarmarkPlus size={isMobile ? 20 : 24} />
        </StyledIconButton>
      </span>
    </Tooltip>
  );

  // Mòbil: tabs horitzontals + panel a sota (fragment per integrar amb el pare)
  if (isMobile) {
    return (
      <>
        <Stack direction="row" alignItems="center">
          <Tabs
            orientation="horizontal"
            variant="scrollable"
            scrollButtons="auto"
            value={value}
            onChange={handleChange}
            aria-label={intl.formatMessage(messages.sequenceNumber)}
            sx={{ minHeight: 36, ...sequenceTabsSx }}
          >
            {tabs}
          </Tabs>
          {addButton}
        </Stack>
        <Box sx={{ width: "100%" }}>
          {/* El nom, l'estil i el menú «⋯» de la seqüència oberta (D21) */}
          <SequenceHeader sequenceKey={value} />
          <TabPanelSequence index={value} />
        </Box>
      </>
    );
  }

  // Desktop: tabs verticals a l'esquerra + panel a la dreta
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label={intl.formatMessage(messages.sequenceNumber)}
          sx={{
            borderRight: 1,
            borderColor: "divider",
            width: 100,
            ...sequenceTabsSx,
          }}
        >
          {tabs}
        </Tabs>
        {addButton}
      </div>
      {/* També a l'escriptori, amb les pestanyes de sempre (D23) */}
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <SequenceHeader sequenceKey={value} />
        <TabPanelSequence index={value} />
      </div>
    </div>
  );
};

export default TabsSequences;
