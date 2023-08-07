import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { card } from "../SettingCardOptions.styled";
import { settingCardOptions } from "./SettingCardFont.lang";
import { fontList } from "../../../../data/fontlist";

interface SettingCardProps {
  setting: "fontFamily";
  state: string;
  setState: any;
}

const SettingCardFont = ({
  setting,
  state,
  setState,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();

  const settingCard = {
    messages: settingCardOptions.messages[setting],
  };

  const handleChange = (event: SelectChangeEvent) => {
    setState(event.target.value as string);
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      columnGap={2}
      sx={card}
    >
      <FormControl fullWidth>
        <InputLabel id="language">
          <FormattedMessage {...settingCard.messages} />
        </InputLabel>
        <Select
          labelId="language"
          id="language-selected"
          value={state}
          label="language"
          onChange={handleChange}
          sx={{ width: 150 }}
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
