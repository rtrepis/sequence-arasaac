import { Slider, Stack, Typography } from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import StyledButton from "../../style/StyledButton";
import { FormattedMessage } from "react-intl";
import { cardAction, card, cardTitle } from "./SettingCardNumber.styled";
import { fontSizeApplyAllActionCreator } from "../../app/slice/sequenceSlice";
import { messages } from "./SettingCardNumber.lang";

interface SettingCardProps {
  setting: "fontSize";
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
}

const SettingCardNumber = ({
  setting,
  state,
  setState,
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
      spacing={2}
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

export default SettingCardNumber;
