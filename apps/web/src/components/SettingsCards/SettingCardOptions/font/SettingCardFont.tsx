import {
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { settingCardOptions } from "./SettingCardFont.lang";
import { fontList } from "../../../../data/fontlist";
import { FontFamily } from "../../../../types/FontFamily";
import SettingRow from "../../../SettingsLayout/SettingRow";
import React from "react";

interface SettingCardProps {
  setting: "fontFamily";
  state: string;
  setState: React.Dispatch<React.SetStateAction<FontFamily>>;
}

const FONT_FAMILY_LABEL_ID = "setting-font-family-label";

const SettingCardFont = ({
  setting,
  state,
  setState,
}: SettingCardProps): React.ReactElement => {
  const settingCard = {
    messages: settingCardOptions.messages[setting],
  };

  const handleChange = (event: SelectChangeEvent) => {
    setState(event.target.value as FontFamily);
  };

  return (
    <SettingRow
      title={<FormattedMessage {...settingCard.messages} />}
      labelId={FONT_FAMILY_LABEL_ID}
    >
      {/* Sense InputLabel flotant: el títol de la fila ja fa d'etiqueta */}
      <Select
        value={state}
        onChange={handleChange}
        fullWidth
        size="small"
        inputProps={{ "aria-labelledby": FONT_FAMILY_LABEL_ID }}
      >
        {fontList.map((font) => (
          <MenuItem value={font} key={font}>
            <Typography fontFamily={font}>{font}</Typography>
          </MenuItem>
        ))}
      </Select>
    </SettingRow>
  );
};

export default SettingCardFont;
