import { Stack, ToggleButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { applyAllSettingActionCreator } from "../../app/slice/sequenceSlice";
import StyledButton from "../../style/StyledButton";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { Skins, SettingToUpdate } from "../../types/sequence";
import { SettingLangI } from "../../types/sequence.lang";
import { messages } from "./SettingCard.lang";
import { cardAction, card, cardContent, cardTitle } from "./SettingCard.styled";

interface SettingCardProps {
  setting: SettingLangI;
  action: (toUpdate: SettingToUpdate) => void;
  isSettingDefault?: boolean | false;
  selected: Skins;
}

const SettingCard = ({
  setting: { types, message: messageSetting, name: setting },
  action,
  isSettingDefault,
  selected,
}: SettingCardProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const uiDefaultSettingType = useAppSelector(
    (state) => state.ui.defaultSettings.PictApiAra[setting]
  );
  const [type, setType] = useState<string | null>("default");

  const handleChangeType = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    setType(newType);
  };

  const handleApplyAll = () => {
    selected !== undefined &&
      dispatch(
        applyAllSettingActionCreator({
          setting: setting,
          value: selected,
        })
      );
  };

  const handleClickSettingType = (value: Skins) => {
    action({
      setting: setting,
      value: value,
    });
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
        <FormattedMessage {...messageSetting} />
      </Typography>

      <StyledToggleButtonGroup
        value={type}
        exclusive
        onChange={handleChangeType}
        aria-label={`${intl.formatMessage({ ...messageSetting })}`}
        sx={cardContent}
      >
        {types
          .filter(({ name }) =>
            isSettingDefault || selected === uiDefaultSettingType
              ? name
              : name !== uiDefaultSettingType
          )
          .map(({ name, message }) => (
            <ToggleButton
              value={name}
              aria-label={intl.formatMessage({ ...message })}
              key={name}
              selected={selected === name}
              onClick={() => handleClickSettingType(name)}
            >
              <Tooltip title={intl.formatMessage({ ...message })} arrow>
                <img
                  src={`/img/settings/${setting}/${name}.png`}
                  alt={`${intl.formatMessage({
                    ...messageSetting,
                  })} ${intl.formatMessage({ ...message })}`}
                  width={40}
                  height={40}
                />
              </Tooltip>
            </ToggleButton>
          ))}

        {!isSettingDefault && (
          <ToggleButton
            value={"default"}
            onClick={() => handleClickSettingType("default")}
            selected={selected === "default"}
          >
            <Tooltip title={intl.formatMessage({ ...messages.default })}>
              <img
                src={`/img/settings/x.png`}
                alt={`${intl.formatMessage({
                  ...messageSetting,
                })} ${intl.formatMessage({ ...messages.default })}`}
                width={40}
                height={40}
              />
            </Tooltip>
          </ToggleButton>
        )}
      </StyledToggleButtonGroup>

      {!isSettingDefault && (
        <StyledButton
          variant="outlined"
          sx={cardAction}
          onClick={handleApplyAll}
        >
          <FormattedMessage {...messages.applyAll} />
        </StyledButton>
      )}
    </Stack>
  );
};

export default SettingCard;
