import { Tab, Tabs, Tooltip } from "@mui/material";
import React, { SyntheticEvent, useState } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { changeActiveSAACActionCreator } from "@/app/slice/documentSlice";
import { AiFillPlusCircle } from "react-icons/ai";

const TabsSequences = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.document.activeSAAC);
  const [amount, setAmount] = useState(1);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    dispatch(changeActiveSAACActionCreator(newValue));
  };

  const handleAddSequence = () => {
    setAmount((prev) => prev + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
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
        <Tab
          label={
            <Tooltip title="Afegir seqüència">
              <span
                onClick={handleAddSequence}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <AiFillPlusCircle size={24} color="#888" />
              </span>
            </Tooltip>
          }
          id="vertical-tab-add"
        />
      </Tabs>

      {/* Panel */}
      <TabPanelSequence index={value} isActive={true} />
    </div>
  );
};

export default TabsSequences;
