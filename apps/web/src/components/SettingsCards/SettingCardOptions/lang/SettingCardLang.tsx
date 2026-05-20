import {
  FormControl,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { SxProps } from "@mui/system";
import { FormattedMessage } from "react-intl";
import { card } from "../../SettingsCards.styled";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { settingCardOptions } from "./SettingCardLang.lang";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { langTranslateApp, langTranslateSearch } from "../../../../configs/languagesConfigs";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { LangsApp } from "../../../../types/ui";
import useSearchPictogram from "../../../../features/pictogram/hooks/useSearchPictogram";

interface SettingCardProps {
  setting: "languagesApp" | "languagesSearch";
  sx?: SxProps;
}

const SettingCardLang = ({ setting, sx }: SettingCardProps): React.ReactElement => {
  const { app: appLang, search: searchLang, keywords } = useAppSelector(
    (store) => store.ui.lang,
  );
  const dispatch = useAppDispatch();
  const { getAllKeyWordsForLanguages } = useSearchPictogram();

  const [lang, setLang] = useState(setting === "languagesApp" ? appLang : searchLang);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setLang(value);

    dispatch(updateLangSettingsActionCreator({
      app: setting === "languagesApp" ? value as LangsApp : appLang,
      search: setting === "languagesSearch" ? value : searchLang,
      keywords: setting === "languagesSearch" ? [] : keywords,
    }));

    getAllKeyWordsForLanguages(value);
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      alignItems={"center"}
      flexWrap={"wrap"}
      columnGap={2}
      sx={{ ...card, ...sx }}
      key={`${setting}-stack`}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold", flex: 1 }} component="h2">
        <FormattedMessage {...settingCardOptions.messages[setting]} />
      </Typography>
      <FormControl key={`${setting}-form`}>
        <Select
          defaultValue={"es"}
          id={setting}
          value={lang}
          onChange={handleChange}
          sx={{ width: 150, borderRadius: "10px" }}
          key={`${setting}-selector`}
        >
          {setting === "languagesSearch" &&
            langTranslateSearch.map((item) => (
              <MenuItem value={item} key={item}>
                {settingCardOptions.languages[item]}
              </MenuItem>
            ))}

          {setting === "languagesApp" &&
            langTranslateApp.map((item) => (
              <MenuItem value={item} key={item}>
                <Link
                  component={RouterLink}
                  to={`../../${item}/create-sequence`}
                  underline="none"
                  color={"MenuText"}
                >
                  {settingCardOptions.languages[item]}
                </Link>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default SettingCardLang;
