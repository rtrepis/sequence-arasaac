import { Stack, ToggleButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { applyAllSettingActionCreator } from "../../app/slice/sequenceSlice";
import StyledButton from "../../style/StyledButton";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { UpdateSettingI, SkinsT } from "../../types/sequence";
import { SettingLangI } from "../../types/sequence.lang";
import { messages } from "./SettingCard.lang";
import { cardAction, card, cardContent, cardTitle } from "./SettingCard.styled";

interface SettingCardProps {
  setting: SettingLangI;
  action: (toUpdate: UpdateSettingI) => void;
  indexPict?: number;
  isSettingDefault?: boolean | false;
}

const SettingCard = ({
  setting: { types, message: messageSetting, name: nameSetting },
  action,
  indexPict,
  isSettingDefault,
}: SettingCardProps): JSX.Element => {
  const pictSettingType = useAppSelector((state) =>
    indexPict === undefined
      ? state.ui.setting[nameSetting]
      : state.sequence[indexPict][nameSetting]
  );
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const uiDefaultSettingType = useAppSelector(
    (state) => state.ui.setting[nameSetting]
  );
  const [type, setType] = useState<string | null>("default");

  const handleChangeType = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    setType(newType);
  };

  const handleApplyAll = () => {
    dispatch(
      applyAllSettingActionCreator({
        setting: nameSetting,
        value: pictSettingType!,
      })
    );
  };

  const handleClickSettingType = (value: SkinsT) => {
    indexPict === undefined
      ? action({ setting: nameSetting, value: value })
      : action({
          index: indexPict,
          setting: nameSetting,
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
            isSettingDefault || pictSettingType === uiDefaultSettingType
              ? name
              : name !== uiDefaultSettingType
          )
          .map(({ name, message }) => (
            <ToggleButton
              value={name}
              aria-label={intl.formatMessage({ ...message })}
              key={name}
              selected={
                isSettingDefault
                  ? uiDefaultSettingType === name
                  : pictSettingType === name
              }
              onClick={() => handleClickSettingType(name)}
            >
              <Tooltip title={intl.formatMessage({ ...message })} arrow>
                <img
                  src={`/img/settings/${nameSetting}/${name}.png`}
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
            selected={pictSettingType === "default"}
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
