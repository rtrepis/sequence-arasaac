import { ToggleButton, Tooltip, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FormattedMessage } from "react-intl";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { Border, PictSequenceSettings } from "../../types/sequence";
import {
  card,
  cardAction,
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
  borderInApplyAllActionCreator,
  borderOutActionCreator,
  borderOutApplyAllActionCreator,
} from "../../app/slice/sequenceSlice";
import StyledButton from "../../style/StyledButton";
import { messages } from "./SettingCardBorder.lang";

interface SettingCardBorderProps {
  indexPict?: number;
  border: "borderIn" | "borderOut";
  selected: Border;
  defaultSetting?: PictSequenceSettings;
}

const SettingCardBorder = ({
  indexPict,
  border,
  selected,
  defaultSetting,
}: SettingCardBorderProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const handlerUpdate = (toUpdateColor?: string, toUpDateSize?: boolean) => {
    const newBorder: Border = {
      color: toUpdateColor ? toUpdateColor : selected.color,
      radius: selected.radius,
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
          updateDefaultSettingPictSequenceActionCreator({ borderIn: newBorder })
        );
      border === "borderOut" &&
        dispatch(
          updateDefaultSettingPictSequenceActionCreator({
            borderOut: newBorder,
          })
        );
    }
  };

  const handleApplyAll = (toUpdate: Border) => {
    border === "borderIn" &&
      dispatch(borderInApplyAllActionCreator({ borderIn: toUpdate }));

    border === "borderOut" &&
      dispatch(borderOutApplyAllActionCreator({ borderOut: toUpdate }));
  };

  const initialColor = selected.color ? selected.color : "#999";

  const [color, setColor] = useState(initialColor);

  const handleChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
    <Stack
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      justifyItems={"center"}
      direction={{ xs: "column", sm: "row" }}
      sx={card}
    >
      <Typography variant="body1" sx={cardTitle} component="h4">
        {border === "borderIn" && (
          <FormattedMessage
            id="component.settingCardBorder.in.title"
            defaultMessage={"Border in"}
          />
        )}

        {border === "borderOut" && (
          <FormattedMessage
            id="component.settingCardBorder.out.title"
            defaultMessage={"Border out"}
          />
        )}
      </Typography>

      <StyledToggleButtonGroup exclusive aria-label={"Border"} sx={cardContent}>
        <ToggleButton
          value={"Fitzgerald Key"}
          sx={cardColor}
          selected={selected.color === "fitzgerald" && selected.size > 0}
          onClick={() => handlerUpdate("fitzgerald")}
        >
          Fitzgerald Key
        </ToggleButton>

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

        <ToggleButton
          value={"whitOutBorder"}
          onClick={() => handlerUpdate(undefined, true)}
          selected={selected.size === 0}
        >
          <Tooltip title={"without border"}>
            <img
              src={`/img/settings/x.png`}
              alt={`without border`}
              width={40}
              height={40}
            />
          </Tooltip>
        </ToggleButton>
      </StyledToggleButtonGroup>

      <StyledButton
        variant="outlined"
        sx={cardAction}
        onClick={() => handleApplyAll(selected)}
      >
        <FormattedMessage {...messages.applyAll} />
      </StyledButton>
    </Stack>
  );
};

export default SettingCardBorder;
