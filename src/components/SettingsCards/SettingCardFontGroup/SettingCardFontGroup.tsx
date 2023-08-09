import { FormLabel, Stack, Typography } from "@mui/material";
import { Font } from "../../../types/sequence";
import SettingCardNumber from "../SettingCardNumber/SettingCardNumber";
import SettingCardFont from "../SettingCardOptions/font/SettingCardFont";
import { useEffect, useState } from "react";
import "./SettingCardFontGroup.css";
import { FormattedMessage } from "react-intl";
import { card, cardTitle } from "../SettingsCards.styled";
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
      columnGap={2}
      sx={card}
    >
      <Typography variant="body1" sx={cardTitle} component="h4">
        <FormattedMessage {...messages.font} />
      </Typography>

      <SettingCardFont
        setting="fontFamily"
        state={family}
        setState={setFamily}
      />

      <SettingCardNumber setting="fontSize" state={size} setState={setSize} />

      <Stack direction={"row"} spacing={2}>
        <FormLabel>
          <FormattedMessage {...messages.color} />
        </FormLabel>
        <input
          id="colorPick"
          type="color"
          className={"colorInput-font"}
          value={color}
          onChange={handleChangesColorSelect}
        />
      </Stack>
    </Stack>
  );
};

export default SettingCardFontGroup;
