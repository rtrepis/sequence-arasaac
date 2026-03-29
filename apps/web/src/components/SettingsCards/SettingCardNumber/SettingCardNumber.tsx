import { FormLabel, Slider, Stack } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { cardAction } from "../SettingsCards.styled";
import { messages } from "./SettingCardNumber.lang";
import ApplyAll from "../ApplyAll/ApplyAll";
import React from "react";

interface SettingCardProps {
  setting: "fontSize";
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
  onApplyAll?: () => void;
}

const SettingCardNumber = ({
  setting,
  state,
  setState,
  onApplyAll,
}: SettingCardProps): React.ReactElement => {
  const handleChange = (event: Event, value: number | number[]) => {
    setState(value as number);
  };

  return (
    <Stack direction={"row"} spacing={2}>
      <FormLabel>
        <FormattedMessage {...messages[setting]} />
      </FormLabel>
      <Slider
        defaultValue={state}
        aria-label={"labelName"}
        valueLabelDisplay="auto"
        max={2}
        min={0.5}
        step={0.1}
        value={state}
        onChange={handleChange}
        sx={{ width: 100 }}
      />

      {onApplyAll && (
        <ApplyAll sx={cardAction} onClick={onApplyAll} />
      )}
    </Stack>
  );
};

export default SettingCardNumber;
