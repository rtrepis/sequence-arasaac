import { Tab, Tabs } from "@mui/material";
import React from "react";
import { useState } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";

const TabsSequences = (): React.ReactElement => {
  const [amount, setAmount] = useState(0);
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
        <Tab
          label="1"
          id={`vertical-tab-${1}`}
          aria-controls={`vertical-tabpanel-${1}`}
        />
        <Tab
          label="2"
          id={`vertical-tab-${2}`}
          aria-controls={`vertical-tabpanel-${2}`}
        />
      </Tabs>
      <TabPanelSequence index={0} isActive={value === 0} />
      <TabPanelSequence index={1} isActive={value === 1} />
    </div>
  );
};

export default TabsSequences;
