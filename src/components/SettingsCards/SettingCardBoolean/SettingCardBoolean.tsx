import { Stack, Switch, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "../../../app/hooks";
import { updateDefaultSettingPictSequenceActionCreator } from "../../../app/slice/uiSlice";
import { messages } from "./SettingCardBoolean.lang";
import { card, cardAction, cardTitle } from "../SettingsCards.styled";
import ApplyAll from "../ApplyAll/ApplyAll";
import { pictAraSettingsApplyAllActionCreator } from "../../../app/slice/sequenceSlice";
import React from "react";

interface SettingCardProps {
  indexPict?: number;
  setting: "numbered" | "corss" | "color";
  state: boolean;
  setState?: React.Dispatch<React.SetStateAction<boolean>>;
  applyAll?: "none";
}

const SettingCardBoolean = ({
  setting,
  state,
  setState,
  applyAll,
}: SettingCardProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    if (setting === "numbered") {
      dispatch(
        updateDefaultSettingPictSequenceActionCreator({
          [setting]: checked,
        }),
      );
    }

    if (setState) {
      setState(!state);
    }
  };

  const handlerApplyAll = () => {
    if (setting === "color") {
      dispatch(pictAraSettingsApplyAllActionCreator({ color: !state }));
    }
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

      {setting === "color" && applyAll !== "none" && (
        <ApplyAll onClick={() => handlerApplyAll()} sx={cardAction}></ApplyAll>
      )}
    </Stack>
  );
};

export default SettingCardBoolean;
