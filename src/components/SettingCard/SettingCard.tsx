import { Stack, ToggleButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "../../app/hooks";
import {
  skinActionCreator,
  skinApplyAllActionCreator,
  textPositionActionCreator,
  textPositionApplyAllActionCreator,
} from "../../app/slice/sequenceSlice";
import {
  updateDefaultSettingPictApiAraActionCreator,
  updateDefaultSettingPictSequenceActionCreator,
} from "../../app/slice/uiSlice";
import StyledButton from "../../style/StyledButton";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { Skins, TextPosition } from "../../types/sequence";
import { messages, settingsCardLang } from "./SettingCard.lang";
import { cardAction, card, cardContent, cardTitle } from "./SettingCard.styled";

interface SettingCardProps {
  indexPict?: number;
  setting: "skin" | "textPosition";
  selected: string;
}

const SettingCard = ({
  indexPict,
  setting,
  selected,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const settingCard = {
    message: settingsCardLang.messages[setting],
    types: Object.entries(settingsCardLang[setting]),
  };

  const handleSelected = (toUpdate: string) => {
    if (indexPict !== undefined) {
      setting === "textPosition" &&
        dispatch(
          textPositionActionCreator({
            indexSequence: indexPict,
            textPosition: toUpdate as TextPosition,
          })
        );

      setting === "skin" &&
        dispatch(
          skinActionCreator({
            indexSequence: indexPict,
            settings: { skin: toUpdate as Skins },
          })
        );
    }

    if (indexPict === undefined) {
      setting === "textPosition" &&
        dispatch(
          updateDefaultSettingPictSequenceActionCreator({
            textPosition: toUpdate as TextPosition,
          })
        );

      setting === "skin" &&
        dispatch(
          updateDefaultSettingPictApiAraActionCreator({
            skin: toUpdate as Skins,
          })
        );
    }
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
            selected={selected === key}
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
        onClick={() => handleApplyAll(selected)}
      >
        <FormattedMessage {...messages.applyAll} />
      </StyledButton>
    </Stack>
  );
};

export default SettingCard;
