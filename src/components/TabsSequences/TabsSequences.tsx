import {
  Tab,
  Tabs,
  Tooltip,
  IconButton,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { SyntheticEvent } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  changeActiveSAACActionCreator,
  addNewSequenceActionCreator,
  deleteLastSequenceActionCreator,
} from "@/app/slice/documentSlice";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";

const TabsSequences = (): React.ReactElement => {
  const dispatch = useAppDispatch();
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
    dispatch(addNewSequenceActionCreator(amount));
    dispatch(changeActiveSAACActionCreator(amount));
  };

  const handleDeleteLastSequence = () => {
    dispatch(deleteLastSequenceActionCreator());
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
    <Tooltip title="Eliminar última seqüència">
      <span>
        <IconButton
          color="secondary"
          onClick={handleDeleteLastSequence}
          disabled={amount <= 1}
          size="small"
        >
          <AiFillMinusCircle
            size={isMobile ? 20 : 24}
            style={{ visibility: amount > 1 ? "visible" : "hidden" }}
          />
        </IconButton>
      </span>
    </Tooltip>
  );

  const addButton = (
    <Tooltip title="Afegir seqüència">
      <span>
        <IconButton
          color="secondary"
          onClick={handleAddSequence}
          size="small"
        >
          <AiFillPlusCircle size={isMobile ? 20 : 24} />
        </IconButton>
      </span>
    </Tooltip>
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
            aria-label="sequence number"
            sx={{ minHeight: 36 }}
          >
            {tabs}
          </Tabs>
          {addButton}
        </Stack>
        <Box sx={{ width: "100%" }}>
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
        {removeButton}
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="sequence number"
          sx={{ borderRight: 1, borderColor: "divider", width: 100 }}
        >
          {tabs}
        </Tabs>
        {addButton}
      </div>
      <TabPanelSequence index={value} />
    </div>
  );
};

export default TabsSequences;
