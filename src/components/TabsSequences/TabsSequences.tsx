import { Tab, Tabs, Tooltip, IconButton } from "@mui/material";
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

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 🔥 Botó "-" a la part superior */}
        <Tooltip title="Eliminar última seqüència">
          <span>
            <IconButton
              color="secondary"
              onClick={handleDeleteLastSequence}
              disabled={amount <= 1}
              size="small"
            >
              <AiFillMinusCircle
                size={24}
                style={{
                  visibility: amount > 1 ? "visible" : "hidden",
                }}
              />
            </IconButton>
          </span>
        </Tooltip>

        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="sequence number"
          sx={{ borderRight: 1, borderColor: "divider", width: 100 }}
        >
          {/* 🔥 Generació automàtica dels Tabs segons "amount" */}
          {[...Array(amount)].map((_, index) => (
            <Tab
              key={`tab-${index}`}
              label={`${index + 1}`}
              id={`vertical-tab-${index}`}
              aria-controls={`vertical-tabpanel-${index}`}
            />
          ))}
        </Tabs>

        {/* 🔥 Botó "+" a la part inferior */}
        <Tooltip title="Afegir seqüència">
          <span>
            <IconButton
              color="secondary"
              onClick={handleAddSequence}
              size="small"
            >
              <AiFillPlusCircle size={24} />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      {/* Panel */}
      <TabPanelSequence index={value} />
    </div>
  );
};

export default TabsSequences;
