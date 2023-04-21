import { Stack, ToggleButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "../../app/hooks";
import {
  skinApplyAllActionCreator,
  textPositionApplyAllActionCreator,
} from "../../app/slice/sequenceSlice";
import StyledButton from "../../style/StyledButton";
import StyledToggleButtonGroup from "../../style/StyledToggleButtonGroup";
import { Skins, TextPosition } from "../../types/sequence";
import { messages, settingsCardLang } from "./SettingCard.lang";
import { cardAction, card, cardContent, cardTitle } from "./SettingCard.styled";

interface SettingCardProps {
  setting: "skin" | "textPosition";
  state: string;
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
        textPositionApplyAllActionCreator({
          textPosition: toUpdate as TextPosition,
        })
      );

    setting === "skin" &&
      dispatch(
        skinApplyAllActionCreator({
          skin: toUpdate as Skins,
        })
      );
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      spacing={2}
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

      <StyledButton
        variant="outlined"
        sx={cardAction}
        onClick={() => handleApplyAll(state)}
      >
        <FormattedMessage {...messages.applyAll} />
      </StyledButton>
    </Stack>
  );
};

export default SettingCard;
