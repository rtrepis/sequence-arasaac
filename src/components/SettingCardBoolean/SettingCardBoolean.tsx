import { Stack, Switch, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "../../app/hooks";
import { updateDefaultSettingPictSequenceActionCreator } from "../../app/slice/uiSlice";
import { messages } from "./SettingCardBoolean.lang";
import { card, cardTitle } from "./SettingCardBoolean.styled";

interface SettingCardProps {
  indexPict?: number;
  setting: "numbered";
  selected: boolean;
}

const SettingCardBoolean = ({
  indexPict,
  setting,
  selected,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleSelected = (toUpdate: boolean) => {
    if (indexPict === undefined) {
      dispatch(
        updateDefaultSettingPictSequenceActionCreator({
          [setting]: toUpdate,
        })
      );
    }
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
        <FormattedMessage {...messages[setting]} />
      </Typography>

      <Switch
        aria-label={`${intl.formatMessage(messages[setting])}`}
        defaultChecked={selected}
        onClick={() => handleSelected(!selected)}
      />
    </Stack>
  );
};

export default SettingCardBoolean;
