import { Box, Button, Popover, ToggleButton } from "@mui/material";
import { useState } from "react";
import ToggleButtonColor from "../../../style/ToggleButtonsColors";
import inputColorList from "../../../data/inputColorList";

interface InputColorProps {
  inputSize: number;
  inputBorder: number;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

const InputColor = ({
  inputBorder,
  inputSize,
  color,
  setColor,
}: InputColorProps): JSX.Element => {
  const circleSize = {
    height: 20,
    width: 20,
  };

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newColor: string
  ) => {
    setColor(newColor);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{ borderRadius: 100, width: 40, height: 40 }}
      >
        <Box
          height={inputSize}
          width={inputSize}
          borderRadius={100}
          bgcolor={color}
          border={inputBorder}
          borderColor={"black"}
        ></Box>
      </Button>
      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ToggleButtonColor exclusive value={color} onChange={handleChange}>
          {inputColorList.map((color) => (
            <ToggleButton value={color} key={color}>
              <Box {...circleSize} borderRadius={100} bgcolor={color}></Box>
            </ToggleButton>
          ))}
        </ToggleButtonColor>
      </Popover>
    </>
  );
};

export default InputColor;

/*         <input
          id="colorPick"
          type="color"
          className={"colorInput-font"}
          value={color}
          onChange={handleChangesColorSelect}
        /> */
