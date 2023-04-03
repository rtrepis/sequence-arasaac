import { ToggleButton, Tooltip, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { Border } from "../../types/sequence";
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
}

const SettingCardBorder = ({
  indexPict,
  border,
  selected,
}: SettingCardBorderProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

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
      direction={{ xs: "column", sm: "row" }}
      sx={card}
    >
      <Stack display={"flex"} direction={{ xs: "column", sm: "row" }}>
        <Typography variant="body1" sx={cardTitle} component="h4">
          <FormattedMessage {...messages[`${border}`]} />
        </Typography>

        <StyledToggleButtonGroup
          exclusive
          aria-label={`${intl.formatMessage(messages[`${border}`])}`}
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
      </Stack>

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
