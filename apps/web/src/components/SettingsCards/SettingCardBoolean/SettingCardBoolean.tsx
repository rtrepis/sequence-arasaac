import { Stack, Switch, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "./SettingCardBoolean.lang";
import { card, cardAction, cardTitle } from "../SettingsCards.styled";
import ApplyAll from "../ApplyAll/ApplyAll";
import React from "react";

interface SettingCardProps {
  setting: "numbered" | "corss" | "color";
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
  onApplyAll?: () => void;
}

const SettingCardBoolean = ({
  setting,
  state,
  setState,
  onApplyAll,
}: SettingCardProps): React.ReactElement => {
  const intl = useIntl();

  const handleSelected = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setState(checked);
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      columnGap={2}
      sx={card}
    >
      <Typography variant="body1" sx={cardTitle} component="h2">
        <FormattedMessage {...messages[setting]} />
      </Typography>

      <Switch
        aria-label={`${intl.formatMessage(messages[setting])}`}
        checked={state}
        onChange={handleSelected}
      />

      {setting === "color" && onApplyAll && (
        <ApplyAll onClick={onApplyAll} sx={cardAction}></ApplyAll>
      )}
    </Stack>
  );
};

export default SettingCardBoolean;
