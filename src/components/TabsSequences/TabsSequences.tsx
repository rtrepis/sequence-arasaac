import { Tab, Tabs, Tooltip } from "@mui/material";
import React, { SyntheticEvent } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  changeActiveSAACActionCreator,
  addNewSequenceActionCreator,
} from "@/app/slice/documentSlice";
import { AiFillPlusCircle } from "react-icons/ai";

const TabsSequences = (): React.ReactElement => {
  const dispatch = useAppDispatch();
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

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="sequence number"
        sx={{ borderRight: 1, borderColor: "divider", width: 100 }}
      >
        {/* 🔥 Generació automàtica dels Tabs segons “amount” */}
        {[...Array(amount)].map((_, index) => (
          <Tab
            key={`tab-${index}`}
            label={`${index + 1}`}
            id={`vertical-tab-${index}`}
            aria-controls={`vertical-tabpanel-${index}`}
          />
        ))}

        {/* 🔥 Botó "+" sense IconButton dins d’un Tab */}
        <Tooltip title="Afegir seqüència">
          <Tab
            icon={<AiFillPlusCircle size={24} color="#888" />}
            id="vertical-tab-add"
            onClick={handleAddSequence}
          />
        </Tooltip>
      </Tabs>

      {/* Panel */}
      <TabPanelSequence index={value} />
    </div>
  );
};

export default TabsSequences;
