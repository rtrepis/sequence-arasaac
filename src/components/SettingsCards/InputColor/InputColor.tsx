import { Box, Button, IconButton, Popover, ToggleButton } from "@mui/material";
import { useState } from "react";
import ToggleButtonColor from "../../../style/ToggleButtonsColors";
import inputColorList from "../../../data/inputColorList";
import { IoIosColorPalette } from "react-icons/io";
import "./InputColor.css";
import React from "react";

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
}: InputColorProps): React.ReactElement => {
  const circleSize = {
    height: "2em",
    width: "2em",
  };

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const initialColorPalette = /^#?([0-9a-f]{3}){1,2}$/.test(color)
    ? true
    : false;
  const [colorPalette, setColorPalette] = useState(initialColorPalette);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newColor: string,
  ) => {
    setColorPalette(false);
    setColor(newColor);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleColorPalette = async () => {
    setColor("input");
    await setColorPalette(true);
    document.getElementById("color-pick")?.click();
  };

  const handleChangesColorSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setColor(event.target.value);
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
        sx={{ textAlign: "center", backgroundColor: { color } }}
      >
        <ToggleButtonColor exclusive value={color} onChange={handleChange}>
          {inputColorList.map((color) => (
            <ToggleButton value={color} key={color}>
              <Box {...circleSize} borderRadius={100} bgcolor={color}></Box>
            </ToggleButton>
          ))}
        </ToggleButtonColor>
        {!colorPalette && (
          <IconButton sx={{ padding: 0.35 }} onClick={handleColorPalette}>
            <IoIosColorPalette size={"1.5em"}></IoIosColorPalette>
          </IconButton>
        )}
        {colorPalette && (
          <input
            id="color-pick"
            type="color"
            className={"colorInput-font"}
            value={color}
            onChange={handleChangesColorSelect}
          />
        )}
      </Popover>
    </>
  );
};

export default InputColor;
