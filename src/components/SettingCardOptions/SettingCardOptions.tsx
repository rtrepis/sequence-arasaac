import {
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { settingCardOptions } from "./SettingCardOptions.lang";
import { card } from "./SettingCardOptions.styled";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useUserLocation from "../../hooks/useUserLocation";

interface SettingCardProps {
  setting: "languages";
  selected: string;
}

const SettingCardOptions = ({
  setting,
  selected,
}: SettingCardProps): JSX.Element => {
  const intl = useIntl();

  const initialLang = useUserLocation();
  const [lang, setLang] = useState(initialLang);

  const settingCard = {
    messages: settingCardOptions.messages[setting],
    types: Object.entries(settingCardOptions[setting]),
  };

  const handleChange = (event: SelectChangeEvent) => {
    setLang(event.target.value as string);
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      spacing={2}
      sx={card}
    >
      <FormControl fullWidth>
        <InputLabel id="language">
          <FormattedMessage {...settingCard.messages} />
        </InputLabel>
        <Select
          labelId="language"
          id="language-selected"
          value={lang}
          label="language"
          onChange={handleChange}
          sx={{ width: 150 }}
        >
          {settingCard.types.map(([key, value]) => (
            <MenuItem value={key} key={key}>
              <Link
                component={RouterLink}
                to={`../../${key}/create-sequence`}
                underline="none"
                color={"MenuText"}
              >
                {intl.formatMessage(value.message)}
              </Link>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default SettingCardOptions;
