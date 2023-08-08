import { Stack, Typography } from "@mui/material";
import { Font } from "../../../types/sequence";
import SettingCardNumber from "../SettingCardNumber/SettingCardNumber";
import SettingCardFont from "../SettingCardOptions/font/SettingCardFont";
import { useEffect, useState } from "react";
import "./SettingCardFontGroup.css";
import { FormattedMessage } from "react-intl";
import { cardTitle } from "../SettingsCards.styled";
import { messages } from "./SettingCardFontGroup.lang";

interface SettingCardFontGroupProps {
  state: Font;
  setState: React.Dispatch<React.SetStateAction<Font>>;
}

const SettingCardFontGroup = ({
  state,
  setState,
}: SettingCardFontGroupProps): JSX.Element => {
  const [family, setFamily] = useState(state.family);
  const [size, setSize] = useState(state.size);
  const [color, setColor] = useState(state.color);

  const handleChangesColorSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setColor(event.target.value);
  };

  useEffect(() => {
    setState({ color: color, family: family, size: size });
  }, [color, family, setState, size]);

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      marginTop={1}
      rowGap={2}
      columnGap={2}
    >
      <SettingCardFont
        setting="fontFamily"
        state={family}
        setState={setFamily}
        object={state}
      />

      <SettingCardNumber setting="fontSize" state={size} setState={setSize} />

      <Typography variant="body1" sx={cardTitle} component="h4">
        <FormattedMessage {...messages.fontColor} />
      </Typography>

      <input
        id="colorPick"
        type="color"
        className={"colorInput-font"}
        value={color}
        onChange={handleChangesColorSelect}
      />
    </Stack>
  );
};

export default SettingCardFontGroup;
