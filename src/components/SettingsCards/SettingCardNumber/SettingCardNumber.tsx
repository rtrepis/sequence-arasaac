import { Slider, Stack, Typography } from "@mui/material";
import { useAppDispatch } from "../../../app/hooks";
import { FormattedMessage } from "react-intl";
import { cardAction, card, cardTitle } from "../SettingsCards.styled";
import { fontSizeApplyAllActionCreator } from "../../../app/slice/sequenceSlice";
import { messages } from "./SettingCardNumber.lang";
import ApplyAll from "../ApplyAll/ApplyAll";

interface SettingCardProps {
  setting: "fontSize";
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
  apply?: boolean;
}

const SettingCardNumber = ({
  setting,
  state,
  setState,
  apply = false,
}: SettingCardProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const handleChange = (event: any, value: number | number[]) => {
    setState(value as number);
  };

  const handleApplyAll = (toUpdate: number) => {
    setting === "fontSize" &&
      dispatch(
        fontSizeApplyAllActionCreator({
          fontSize: toUpdate,
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
      <Slider
        defaultValue={state}
        aria-label={"labelName"}
        valueLabelDisplay="auto"
        max={2}
        min={0.5}
        step={0.1}
        value={state}
        onChange={handleChange}
        sx={{ width: 100 }}
      />

      {apply && (
        <ApplyAll sx={cardAction} onClick={() => handleApplyAll(state)} />
      )}
    </Stack>
  );
};

export default SettingCardNumber;
