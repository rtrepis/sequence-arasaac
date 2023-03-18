import {
  Button,
  Divider,
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { applyAllSettingActionCreator } from "../../app/slice/sequenceSlice";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { UpdateSettingI } from "../../types/sequence";
import { SettingLangI } from "../../types/sequence.lang";
import { messages } from "./SettingCard.lang";
import { button__ApplyAll } from "./SettingCard.styled";

interface SettingCardProps {
  setting: SettingLangI;
  action: (toUpdate: UpdateSettingI) => void;
  indexPict?: number;
}

const SettingCard = ({
  setting: { types, message: messageSetting, name: nameSetting },
  action,
  indexPict,
}: SettingCardProps): JSX.Element => {
  const settingType = useAppSelector((state) =>
    indexPict === undefined
      ? state.ui.setting[nameSetting]
      : state.sequence[indexPict][nameSetting]
  );
  const dispatch = useAppDispatch();
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
        value: settingType!,
      })
    );
  };

  const payload: UpdateSettingI =
    indexPict === undefined
      ? { setting: nameSetting, value: "default" }
      : { index: indexPict, setting: nameSetting, value: "default" };

  const intl = useIntl();

  const message = defineMessages({
    default: {
      id: "components.settingItem.default.label",
      defaultMessage: "Default",
      description: "Type setting item",
    },
  });

  return (
    <Stack
      display={"flex"}
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold" }} component="h4">
        <FormattedMessage {...messageSetting} />
      </Typography>
      <Divider />

      <StyledToggleButtonGroup
        value={type}
        exclusive
        onChange={handleChangeType}
        aria-label={`${intl.formatMessage({ ...messageSetting })}`}
      >
        {types.map(({ name, message }) => (
          <ToggleButton
            selected={settingType === name}
            value={name}
            aria-label={intl.formatMessage({ ...message })}
            key={name}
            onClick={() =>
              action(
                indexPict === undefined
                  ? { setting: nameSetting, value: name }
                  : { index: indexPict, setting: nameSetting, value: name }
              )
            }
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

        <ToggleButton
          value={"default"}
          onClick={() => action(payload)}
          selected={settingType === "default"}
        >
          <Tooltip title={intl.formatMessage({ ...message.default })}>
            <img
              src={`/img/settings/x.png`}
              alt={`${intl.formatMessage({
                ...messageSetting,
              })} ${intl.formatMessage({ ...message.default })}`}
              width={40}
              height={40}
            />
          </Tooltip>
        </ToggleButton>
      </StyledToggleButtonGroup>

      <Divider />

      <Button
        variant="contained"
        sx={button__ApplyAll}
        onClick={handleApplyAll}
      >
        <FormattedMessage {...messages.applyAll} />
      </Button>
    </Stack>
  );
};

export default SettingCard;
