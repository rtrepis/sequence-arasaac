import { TextField } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { messages } from "./SettingCardTextFiled.lang";
import SettingRow from "../../SettingsLayout/SettingRow";
import React from "react";

interface SettingCardTextFiledProps {
  setting: "customText";
  state: string | undefined;
  setState: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const SettingCadTextFiled = ({
  setting,
  state,
  setState,
}: SettingCardTextFiledProps): React.ReactElement => {
  const labelId = `textfield-label-${setting}`;

  return (
    <SettingRow
      title={<FormattedMessage {...messages[setting]} />}
      labelId={labelId}
    >
      <TextField
        value={state}
        onChange={(event) => setState(event.target.value)}
        variant="filled"
        fullWidth
        inputProps={{ "aria-labelledby": labelId }}
        sx={{ ".MuiInputBase-input": { paddingTop: 2 } }}
      />
    </SettingRow>
  );
};

export default SettingCadTextFiled;
