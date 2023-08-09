import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { settingCardOptions } from "./SettingCardFont.lang";
import { fontList } from "../../../../data/fontlist";
import { FontFamily } from "../../../../types/FontFamily";

interface SettingCardProps {
  setting: "fontFamily";
  state: string;
  setState: React.Dispatch<React.SetStateAction<FontFamily>>;
}

const SettingCardFont = ({
  setting,
  state,
  setState,
}: SettingCardProps): JSX.Element => {
  const settingCard = {
    messages: settingCardOptions.messages[setting],
  };

  const handleChange = (event: SelectChangeEvent) => {
    setState(event.target.value as FontFamily);
  };

  return (
    <Stack direction={"row"}>
      <FormControl fullWidth>
        <InputLabel id="fontFamily">
          <FormattedMessage {...settingCard.messages} />
        </InputLabel>
        <Select
          labelId="fontFamily"
          id="language-selected"
          value={state}
          label="fontFamily"
          onChange={handleChange}
          sx={{ width: 200 }}
        >
          {fontList.map((font) => (
            <MenuItem value={font} key={font}>
              <Typography fontFamily={font}>{font}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default SettingCardFont;
