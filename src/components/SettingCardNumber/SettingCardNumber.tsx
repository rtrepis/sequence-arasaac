import { Slider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { updateDefaultSettingPictSequenceActionCreator } from "../../app/slice/uiSlice";
import StyledButton from "../../style/StyledButton";
import { FormattedMessage } from "react-intl";
import { cardAction, card, cardTitle } from "./SettingCardNumber.styled";
import {
  fontSizeActionCreator,
  fontSizeApplyAllActionCreator,
} from "../../app/slice/sequenceSlice";
import { messages } from "./SettingCardNumber.lang";

interface SettingCardProps {
  indexPict?: number;
  setting: "fontSize";
  selected: number;
}

const SettingCardNumber = ({
  indexPict,
  setting,
  selected,
}: SettingCardProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const initialValue: number = selected;
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    indexPict !== undefined &&
      dispatch(
        fontSizeActionCreator({
          indexSequence: indexPict,
          fontSize: newValue as number,
        })
      );
  };

  const handleBlur = () => {
    if (indexPict === undefined) {
      dispatch(
        updateDefaultSettingPictSequenceActionCreator({ fontSize: value })
      );
    }
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
        <FormattedMessage {...messages.fontSize} />
      </Typography>
      <Slider
        defaultValue={selected}
        aria-label={"labelName"}
        valueLabelDisplay="auto"
        max={2}
        min={0.5}
        step={0.1}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        sx={{ width: 100 }}
      />
      <StyledButton
        variant="outlined"
        sx={cardAction}
        onClick={() => handleApplyAll(value)}
      >
        <FormattedMessage {...messages.applyAll} />
      </StyledButton>
    </Stack>
  );
};

export default SettingCardNumber;
