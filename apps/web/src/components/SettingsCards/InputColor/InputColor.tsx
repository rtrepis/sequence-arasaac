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
  /** Notifica el pare quan s'obre o es tanca la paleta, per amagar-hi tooltips que la taparien. */
  onOpenChange?: (isOpen: boolean) => void;
}

const InputColor = ({
  inputBorder,
  inputSize,
  color,
  setColor,
  onOpenChange,
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
    onOpenChange?.(false);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
    onOpenChange?.(true);
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
        sx={{
          borderRadius: 100,
          width: 55,
          height: 55,
          minWidth: 55,
          padding: 0,
          // Mateix marc de hover que els toggle buttons de settings (55px, radi 20)
          "&:hover": {
            border: "1.75px solid",
            borderColor: "primary.main",
            borderRadius: "20px",
            boxShadow: "0px 0px 10px 1px #A6A6A6",
          },
        }}
      >
        <Box
          height={inputSize}
          width={inputSize}
          borderRadius={100}
          bgcolor={color}
          border={inputBorder}
          borderColor={"text.primary"}
        ></Box>
      </Button>
      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{ textAlign: "center" }}
        slotProps={{
          // Mateix glow gris que la resta de controls de settings
          paper: { sx: { boxShadow: "0px 0px 10px 1px #A6A6A6" } },
        }}
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
