import {
  FormLabel,
  Slider,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { Border } from "../../types/sequence";
import {
  card,
  cardColor,
  cardContent,
  cardTitle,
} from "./SettingCardBorder.styled";
import "./SettingCardBorder.css";
import { useAppDispatch } from "../../app/hooks";
import { updateDefaultSettingPictSequenceActionCreator } from "../../app/slice/uiSlice";
import { useState } from "react";
import {
  borderInActionCreator,
  borderOutActionCreator,
} from "../../app/slice/sequenceSlice";
import { messages } from "./SettingCardBorder.lang";

interface SettingCardBorderProps {
  indexPict?: number;
  border: "borderIn" | "borderOut";
  selected: Border;
}

const SettingCardBorder = ({
  indexPict,
  border,
  selected,
}: SettingCardBorderProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const initialColor = selected.color ? selected.color : "#999999";

  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(selected.size);
  const [radius, setRadius] = useState(selected.radius);

  const handleChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };
  const handleChangesSize = (event: Event, newValue: number | number[]) => {
    setSize(newValue as number);
  };
  const handleChangesRadius = (event: Event, newValue: number | number[]) => {
    setRadius(newValue as number);
  };

  const handlerUpdate = (toUpdateColor?: string, toUpDateSize?: boolean) => {
    const newBorder: Border = {
      color: toUpdateColor ? toUpdateColor : selected.color,
      radius: toUpDateSize ? 0 : 20,
      size: toUpDateSize ? 0 : 2,
    };

    if (indexPict !== undefined) {
      border === "borderIn" &&
        dispatch(
          borderInActionCreator({
            indexSequence: indexPict,
            borderIn: newBorder,
          })
        );

      border === "borderOut" &&
        dispatch(
          borderOutActionCreator({
            indexSequence: indexPict,
            borderOut: newBorder,
          })
        );
    }

    if (indexPict === undefined) {
      border === "borderIn" &&
        dispatch(
          updateDefaultSettingPictSequenceActionCreator({
            borderIn: newBorder,
          })
        );
      border === "borderOut" &&
        dispatch(
          updateDefaultSettingPictSequenceActionCreator({
            borderOut: newBorder,
          })
        );
    }
  };

  const handleBlur = () => {
    const newBorder: Border = {
      color: color,
      radius: radius,
      size: size,
    };

    if (indexPict === undefined) {
      dispatch(
        updateDefaultSettingPictSequenceActionCreator({
          [border]: newBorder,
        })
      );
    }
  };

  return (
    <>
      <Stack
        display={"flex"}
        direction={"row"}
        flexWrap={"wrap"}
        spacing={2}
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
            selected={selected.color === "fitzgerald" && selected.size > 0}
            onClick={() => handlerUpdate("fitzgerald")}
          >
            <FormattedMessage {...messages.fitzgeraldKey} />
          </ToggleButton>

          <Tooltip title={intl.formatMessage(messages.selected)}>
            <ToggleButton
              value={"Selected Color"}
              selected={selected.color !== "fitzgerald" && selected.size > 0}
            >
              <input
                id="colorPick"
                type="color"
                className={"colorInput"}
                value={color}
                onChange={handleChanges}
                onFocus={() => handlerUpdate(color)}
                onBlur={() => handlerUpdate(color)}
              />
            </ToggleButton>
          </Tooltip>

          <ToggleButton
            value={"whitOutBorder"}
            onClick={() => handlerUpdate(undefined, true)}
            selected={selected.size === 0}
          >
            <Tooltip title={intl.formatMessage(messages.withoutBorder)}>
              <img
                src={`/img/settings/x.png`}
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
            defaultValue={selected.size}
            aria-label={`${intl.formatMessage(messages.size)}`}
            valueLabelDisplay="auto"
            max={10}
            min={1}
            value={size}
            onChange={handleChangesSize}
            onBlur={handleBlur}
            sx={{ width: 100 }}
            disabled={selected.size === 0}
          />
        </Stack>

        <Stack direction={"row"} spacing={2}>
          <FormLabel>
            <FormattedMessage {...messages.radius} />
          </FormLabel>
          <Slider
            defaultValue={selected.radius}
            aria-label={`${intl.formatMessage(messages.radius)}`}
            valueLabelDisplay="auto"
            max={70}
            min={1}
            value={radius}
            onChange={handleChangesRadius}
            onBlur={handleBlur}
            sx={{ width: 100 }}
            disabled={selected.size === 0}
          />
        </Stack>
      </Stack>
    </>
  );
};

export default SettingCardBorder;
