import { Stack, ToggleButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import StyledButton from "../../style/StyledButton";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { PictAllSettings } from "../../types/sequence";
import { messages, settingsCardLang } from "./SettingCard.lang";
import { cardAction, card, cardContent, cardTitle } from "./SettingCard.styled";

interface SettingCardProps {
  setting: "skin" | "textPosition";
  actionSelected: (toUpdate: PictAllSettings) => void;
  defaultSetting?: string;
  selected: string;
  applyAll?: (toUpdate: PictAllSettings) => void;
}

const SettingCard = ({
  setting,
  actionSelected: action,
  defaultSetting,
  selected,
  applyAll,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();

  const [type, setType] = useState<string | null>("default");

  const settingCard = {
    message: settingsCardLang.messages[setting],
    types: Object.entries(settingsCardLang[setting]),
  };

  const handleChangeType = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    setType(newType);
  };

  return (
    <Stack
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      justifyItems={"center"}
      direction={{ xs: "column", sm: "row" }}
      sx={card}
    >
      <Typography variant="body1" sx={cardTitle} component="h4">
        <FormattedMessage {...settingCard.message} />
      </Typography>

      <StyledToggleButtonGroup
        value={type}
        exclusive
        onChange={handleChangeType}
        aria-label={`${intl.formatMessage(settingCard.message)}`}
        sx={cardContent}
      >
        {settingCard.types
          .filter(([type, values]) => type !== defaultSetting)
          .map(([key, value]) => (
            <ToggleButton
              value={key}
              aria-label={intl.formatMessage(value.message)}
              key={key}
              selected={selected === key}
              onClick={() => action({ [setting]: key } as PictAllSettings)}
            >
              <Tooltip title={intl.formatMessage(value.message)} arrow>
                <img
                  src={`/img/settings/${setting}/${key}.png`}
                  alt={`${intl.formatMessage({
                    ...settingCard.message,
                  })} ${intl.formatMessage(value.message)}`}
                  width={40}
                  height={40}
                />
              </Tooltip>
            </ToggleButton>
          ))}

        {defaultSetting !== undefined && (
          <ToggleButton
            value={"default"}
            onClick={() =>
              action({ [setting]: defaultSetting } as PictAllSettings)
            }
            selected={selected === defaultSetting}
          >
            <Tooltip title={intl.formatMessage({ ...messages.default })}>
              <img
                src={`/img/settings/x.png`}
                alt={`${intl.formatMessage({
                  ...settingCard.message,
                })} ${intl.formatMessage({ ...messages.default })}`}
                width={40}
                height={40}
              />
            </Tooltip>
          </ToggleButton>
        )}
      </StyledToggleButtonGroup>

      {applyAll !== undefined && (
        <StyledButton
          variant="outlined"
          sx={cardAction}
          onClick={() => applyAll({ [setting]: selected } as PictAllSettings)}
        >
          <FormattedMessage {...messages.applyAll} />
        </StyledButton>
      )}
    </Stack>
  );
};

export default SettingCard;
