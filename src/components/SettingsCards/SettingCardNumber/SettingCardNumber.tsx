import { FormLabel, Slider, Stack } from "@mui/material";
import { useAppDispatch } from "../../../app/hooks";
import { FormattedMessage } from "react-intl";
import { cardAction } from "../SettingsCards.styled";
import { fontSizeApplyAllActionCreator } from "../../../app/slice/sequenceSlice";
import { messages } from "./SettingCardNumber.lang";
import ApplyAll from "../ApplyAll/ApplyAll";
import React from "react";

interface SettingCardProps {
  setting: "fontSize";
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
  apply?: boolean;
}

const SettingCardNumber = ({
  setting,
  state,
  setState,
  apply = false,
}: SettingCardProps): React.ReactElement => {
  const dispatch = useAppDispatch();

  const handleChange = (event: Event, value: number | number[]) => {
    setState(value as number);
  };

  const handleApplyAll = (toUpdate: number) => {
    if (setting === "fontSize")
      dispatch(
        fontSizeApplyAllActionCreator({
          fontSize: toUpdate,
        }),
      );
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

      {apply && (
        <ApplyAll sx={cardAction} onClick={() => handleApplyAll(state)} />
      )}
    </Stack>
  );
};

export default SettingCardNumber;
