import {
  Tab,
  Tabs,
  Tooltip,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { SyntheticEvent, useState } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  changeActiveSAACActionCreator,
  addNewSequenceActionCreator,
  deleteLastSequenceActionCreator,
} from "@features/sequence/store/documentSlice";
import { BsFileEarmarkPlus, BsFileEarmarkMinus } from "react-icons/bs";
import StyledIconButton from "@/style/StyledIconButton";
import { useIntl } from "react-intl";
import messages from "./TabsSequences.lang";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

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
  // Quants pictogrames amb contingut té l'última seqüència: és el que es perdria
  // en esborrar-la. Els buits no compten — tornar-los a posar és un clic
  const lastSequenceFilled = useAppSelector((state) => {
    const keys = Object.keys(state.document.content);
    const last = state.document.content[Number(keys[keys.length - 1])] ?? [];
    return last.filter(
      (pict) => pict.img.selectedId > 0 || pict.img.url || pict.text,
    ).length;
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    dispatch(changeActiveSAACActionCreator(newValue));
  };

  const handleAddSequence = () => {
    dispatch(addNewSequenceActionCreator(amount));
    dispatch(changeActiveSAACActionCreator(amount));
  };

  const deleteLastSequence = () => {
    setIsConfirmOpen(false);
    dispatch(deleteLastSequenceActionCreator());
  };

  // Esborrar una seqüència s'endú tots els seus pictogrames i no hi ha desfer.
  // Amb la seqüència buida no hi ha res a perdre i la confirmació només seria
  // fricció: el criteri és quant costa refer-ho, no com sona l'acció
  const handleDeleteLastSequence = () => {
    if (lastSequenceFilled > 0) {
      setIsConfirmOpen(true);
      return;
    }
    deleteLastSequence();
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

  const removeButton = (
    <Tooltip
      title={intl.formatMessage(messages.deleteLastSequence)}
      style={{ visibility: amount > 1 ? "visible" : "hidden" }}
    >
      <span>
        {/* `secondary.main` és el gris verdós dels fons, no una tinta: sobre el
            full es quedava a 1,15:1 i el botó gairebé no hi era */}
        <StyledIconButton
          color="inherit"
          onClick={handleDeleteLastSequence}
          disabled={amount <= 1}
          size="small"
          aria-label={intl.formatMessage(messages.deleteLastSequence)}
        >
          <BsFileEarmarkMinus
            size={isMobile ? 20 : 24}
            style={{ visibility: amount > 1 ? "visible" : "hidden" }}
          />
        </StyledIconButton>
      </span>
    </Tooltip>
  );

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

  const confirmDialog = (
    <ConfirmDialog
      open={isConfirmOpen}
      title={intl.formatMessage(messages.confirmDeleteTitle, {
        number: amount,
      })}
      body={intl.formatMessage(messages.confirmDeleteBody, {
        count: lastSequenceFilled,
      })}
      confirmLabel={intl.formatMessage(messages.confirmDelete)}
      onConfirm={deleteLastSequence}
      onCancel={() => setIsConfirmOpen(false)}
    />
  );

  // Mòbil: tabs horitzontals + panel a sota (fragment per integrar amb el pare)
  if (isMobile) {
    return (
      <>
        <Stack direction="row" alignItems="center">
          {removeButton}
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
          <TabPanelSequence index={value} />
        </Box>
        {confirmDialog}
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
        {removeButton}
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
      <TabPanelSequence index={value} />
      {confirmDialog}
    </div>
  );
};

export default TabsSequences;
