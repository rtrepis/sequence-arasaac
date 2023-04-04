import { Slider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { card, cardTitle } from "./SettingCardNumber.styled";

interface SettingCardProps {
  indexPict?: number;
  setting: "borderInSize";
  selected: number;
}

const SettingCardNumber = ({
  indexPict,
  setting,
  selected,
}: SettingCardProps): JSX.Element => {
  const initialValue: number = selected;
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleBlur = () => {};

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      spacing={2}
      sx={card}
    >
      <Typography variant="body1" sx={cardTitle} component="h2">
        Title
      </Typography>
      <Slider
        defaultValue={selected}
        aria-label={"labelName"}
        valueLabelDisplay="auto"
        max={10}
        min={1}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        sx={{ width: 50 }}
      />
    </Stack>
  );
};

export default SettingCardNumber;
