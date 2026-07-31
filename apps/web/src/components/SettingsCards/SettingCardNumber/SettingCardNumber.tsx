import { Slider } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "./SettingCardNumber.lang";
import SettingRow from "../../SettingsLayout/SettingRow";
import React from "react";

interface SettingCardProps {
  setting: "fontSize";
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
}

const SettingCardNumber = ({
  setting,
  state,
  setState,
}: SettingCardProps): React.ReactElement => {
  const intl = useIntl();

  const handleChange = (event: Event, value: number | number[]) => {
    setState(value as number);
  };

  return (
    <SettingRow title={<FormattedMessage {...messages[setting]} />}>
      <Slider
        aria-label={intl.formatMessage(messages[setting])}
        valueLabelDisplay="auto"
        max={2}
        min={0.5}
        step={0.1}
        value={state}
        onChange={handleChange}
      />
    </SettingRow>
  );
};

export default SettingCardNumber;
