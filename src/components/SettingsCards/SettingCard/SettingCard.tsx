import { Stack, ToggleButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "../../../app/hooks";
import {
  pictAraSettingsApplyAllActionCreator,
  pictSequenceApplyAllActionCreator,
} from "../../../app/slice/sequenceSlice";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import { Hair, Skin, TextPosition } from "../../../types/sequence";
import { settingsCardLang } from "./SettingCard.lang";
import {
  cardAction,
  card,
  cardContent,
  cardTitle,
} from "../SettingsCards.styled";
import ApplyAll from "../ApplyAll/ApplyAll";

interface SettingCardProps {
  setting: "skin" | "textPosition" | "hair";
  state: string | undefined;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const SettingCard = ({
  setting,
  setState,
  state,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const settingCard = {
    message: settingsCardLang.messages[setting],
    types: Object.entries(settingsCardLang[setting]),
  };

  const handleSelected = (toUpdate: string) => {
    setState(toUpdate);
  };

  const handleApplyAll = (toUpdate: string) => {
    setting === "textPosition" &&
      dispatch(
        pictSequenceApplyAllActionCreator({
          textPosition: toUpdate as TextPosition,
        })
      );

    setting === "skin" &&
      dispatch(
        pictAraSettingsApplyAllActionCreator({
          skin: toUpdate as Skin,
        })
      );

    setting === "hair" &&
      dispatch(
        pictAraSettingsApplyAllActionCreator({
          hair: toUpdate as Hair,
        })
      );
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
        <FormattedMessage {...settingCard.message} />
      </Typography>

      <StyledToggleButtonGroup
        exclusive
        aria-label={`${intl.formatMessage(settingCard.message)}`}
        sx={cardContent}
      >
        {settingCard.types.map(([key, value]) => (
          <ToggleButton
            value={key}
            aria-label={intl.formatMessage(value.message)}
            key={key}
            selected={state === key}
            onClick={() => handleSelected(key)}
          >
            <img
              src={`/img/settings/${setting}/${key}.png`}
              alt={`${intl.formatMessage({
                ...settingCard.message,
              })} ${intl.formatMessage(value.message)}`}
              width={40}
              height={40}
            />
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>

      {state && (
        <ApplyAll sx={cardAction} onClick={() => handleApplyAll(state)} />
      )}
    </Stack>
  );
};

export default SettingCard;
