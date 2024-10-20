import {
  FormLabel,
  Slider,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import { Border } from "../../../types/sequence";
import {
  card,
  cardColor,
  cardContent,
  cardTitle,
} from "../SettingsCards.styled";
import "./SettingCardBorder.css";
import { messages } from "./SettingCardBorder.lang";
import { useState } from "react";
import InputColor from "../InputColor/InputColor";
import React from "react";

interface SettingCardBorderProps {
  border: "borderIn" | "borderOut";
  state: Border;
  setState: React.Dispatch<React.SetStateAction<Border>>;
  indexPict?: number;
}

const SettingCardBorder = ({
  border,
  state: { color, size, radius },
  setState,
}: SettingCardBorderProps): React.ReactElement => {
  const intl = useIntl();

  const [colorSelect, setColorSelect] = useState(color);

  const handlerClickColor = () => {
    const border: Border = {
      color: colorSelect,
      radius: radius === 0 ? 20 : radius,
      size: size === 0 ? 2 : size,
    };

    setState(border);
  };

  const handleChangesSize = (event: Event, newValue: number | number[]) => {
    const border: Border = {
      color: color,
      radius: radius,
      size: newValue as number,
    };

    setState(border);
  };

  const handleChangesRadius = (event: Event, newValue: number | number[]) => {
    const border: Border = {
      color: color,
      radius: newValue as number,
      size: size,
    };

    setState(border);
  };

  const handlerUpdateColor = (
    toUpdateColor?: string,
    toUpDateSize?: boolean,
  ) => {
    const newBorder: Border = {
      color: toUpdateColor ? toUpdateColor : colorSelect,
      radius: toUpDateSize ? 0 : radius === 0 ? 20 : radius,
      size: toUpDateSize ? 0 : size === 0 ? 2 : size,
    };

    setState(newBorder);
  };

  return (
    <>
      <Stack
        display={"flex"}
        direction={"row"}
        flexWrap={"wrap"}
        columnGap={2}
        sx={card}
      >
        <Typography variant="body1" sx={cardTitle} component="h4">
          <FormattedMessage {...messages[border]} />
        </Typography>

        <StyledToggleButtonGroup
          exclusive
          aria-label={`${intl.formatMessage(messages[border])}`}
          sx={cardContent}
        >
          <ToggleButton
            value={"Fitzgerald Key"}
            sx={cardColor}
            selected={color === "fitzgerald" && size > 0}
            onClick={() => handlerUpdateColor("fitzgerald")}
          >
            <FormattedMessage {...messages.fitzgeraldKey} />
          </ToggleButton>

          <Tooltip title={intl.formatMessage(messages.selected)}>
            <ToggleButton
              value={"Selected Color"}
              selected={color !== "fitzgerald" && size > 0}
              onBlur={handlerClickColor}
            >
              <InputColor
                color={colorSelect}
                setColor={setColorSelect}
                inputBorder={1}
                inputSize={35}
              />
            </ToggleButton>
          </Tooltip>

          <ToggleButton
            value={"whitOutBorder"}
            onClick={() => handlerUpdateColor(undefined, true)}
            selected={size === 0}
          >
            <Tooltip title={intl.formatMessage(messages.withoutBorder)}>
              <img
                src={`../img/settings/x.png`}
                alt={intl.formatMessage(messages.withoutBorder)}
                width={40}
                height={40}
              />
            </Tooltip>
          </ToggleButton>
        </StyledToggleButtonGroup>

        <Stack direction={"row"} spacing={2}>
          <FormLabel>
            <FormattedMessage {...messages.size} />
          </FormLabel>
          <Slider
            defaultValue={size}
            aria-label={`${intl.formatMessage(messages.size)}`}
            valueLabelDisplay="auto"
            max={10}
            min={1}
            value={size}
            onChange={handleChangesSize}
            sx={{ width: 100 }}
            disabled={size === 0}
          />
        </Stack>

        <Stack direction={"row"} spacing={2}>
          <FormLabel>
            <FormattedMessage {...messages.radius} />
          </FormLabel>
          <Slider
            defaultValue={radius}
            aria-label={`${intl.formatMessage(messages.radius)}`}
            valueLabelDisplay="auto"
            max={70}
            min={1}
            value={radius}
            onChange={handleChangesRadius}
            sx={{ width: 100 }}
            disabled={size === 0}
          />
        </Stack>
      </Stack>
    </>
  );
};

export default SettingCardBorder;
