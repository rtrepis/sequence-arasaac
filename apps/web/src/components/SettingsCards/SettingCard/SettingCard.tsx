import { Box, ToggleButton } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import { settingsCardLang } from "./SettingCard.lang";
import SettingRow from "../../SettingsLayout/SettingRow";
import React from "react";

interface SettingCardProps {
  setting: "skin" | "textPosition" | "hair";
  state: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const SettingCard = ({
  setting,
  setState,
  state,
}: SettingCardProps): React.ReactElement => {
  const intl = useIntl();

  const settingCard = {
    message: settingsCardLang.messages[setting],
    types: Object.entries(settingsCardLang[setting]),
  };

  const handleSelected = (toUpdate: string) => {
    setState(toUpdate);
  };

  return (
    <SettingRow
      title={<FormattedMessage {...settingCard.message} />}
      control="wide"
    >
      <StyledToggleButtonGroup
        exclusive
        aria-label={`${intl.formatMessage(settingCard.message)}`}
      >
        {settingCard.types.map(([key, value]) => (
          <ToggleButton
            value={key}
            aria-label={intl.formatMessage(value.message)}
            key={key}
            selected={state === key}
            onClick={() => handleSelected(key)}
          >
            <Box
              component="img"
              src={`../img/settings/${setting}/${key}.png`}
              alt={`${intl.formatMessage({
                ...settingCard.message,
              })} ${intl.formatMessage(value.message)}`}
              width={40}
              height={40}
              sx={(theme) => ({
                // En mode fosc invertim el negre de la icona a blanc mantenint el vermell;
                // només per a textPosition (skin i hair són contingut, no UI)
                filter:
                  theme.palette.mode === "dark" && setting === "textPosition"
                    ? "invert(1) hue-rotate(180deg)"
                    : "none",
              })}
            />
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    </SettingRow>
  );
};

export default SettingCard;
