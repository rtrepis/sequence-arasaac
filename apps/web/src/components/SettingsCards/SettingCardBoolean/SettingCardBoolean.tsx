import { Switch } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "./SettingCardBoolean.lang";
import SettingRow from "../../SettingsLayout/SettingRow";
import React from "react";

interface SettingCardProps {
  setting: "numbered" | "corss" | "color";
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingCardBoolean = ({
  setting,
  state,
  setState,
}: SettingCardProps): React.ReactElement => {
  const intl = useIntl();

  const handleSelected = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setState(checked);
  };

  return (
    <SettingRow
      title={<FormattedMessage {...messages[setting]} />}
      control="compact"
    >
      <Switch
        aria-label={`${intl.formatMessage(messages[setting])}`}
        checked={state}
        onChange={handleSelected}
      />
    </SettingRow>
  );
};

export default SettingCardBoolean;
