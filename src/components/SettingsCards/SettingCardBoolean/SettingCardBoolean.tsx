import { Stack, Switch, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "../../../app/hooks";
import { updateDefaultSettingPictSequenceActionCreator } from "../../../app/slice/uiSlice";
import { messages } from "./SettingCardBoolean.lang";
import { card, cardTitle } from "../SettingsCards.styled";

interface SettingCardProps {
  indexPict?: number;
  setting: "numbered";
  selected: boolean;
}

const SettingCardBoolean = ({
  setting,
  selected,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    dispatch(
      updateDefaultSettingPictSequenceActionCreator({
        [setting]: checked,
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
        <FormattedMessage {...messages[setting]} />
      </Typography>

      <Switch
        aria-label={`${intl.formatMessage(messages[setting])}`}
        checked={selected}
        onChange={handleSelected}
      />
    </Stack>
  );
};

export default SettingCardBoolean;
