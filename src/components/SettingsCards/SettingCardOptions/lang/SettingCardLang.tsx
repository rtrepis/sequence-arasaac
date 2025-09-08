import {
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { card } from "../../SettingsCards.styled";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { settingCardOptions } from "./SettingCardLang.lang";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  langTranslateApp,
  langTranslateSearch,
} from "../../../../configs/languagesConfigs";
import { updateLangSettingsActionCreator } from "../../../../app/slice/uiSlice";
import { Ui } from "../../../../types/ui";
import useAraSaac from "/src/hooks/useAraSaac";

interface SettingCardProps {
  setting: "languagesApp" | "languagesSearch";
}

const SettingCardLang = ({ setting }: SettingCardProps): React.ReactElement => {
  const { app: appLang, search: searchLang } = useAppSelector(
    (store) => store.ui.lang,
  );
  const dispatch = useAppDispatch();
  const { getAllKeyWordsForLanguages } = useAraSaac();

  const initialLang = setting === "languagesApp" ? appLang : searchLang;
  const [lang, setLang] = useState(initialLang);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setLang(value);

    const newLangValue = {
      app: setting === "languagesApp" ? value : appLang,
      search: setting === "languagesSearch" ? value : searchLang,
    };

    dispatch(updateLangSettingsActionCreator(newLangValue as Ui["lang"]));
    sessionStorage.setItem("langSettings", JSON.stringify(newLangValue));
    localStorage.setItem("langSettings", JSON.stringify(newLangValue));

    getAllKeyWordsForLanguages(value);
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      columnGap={2}
      sx={card}
      key={`${setting}-stack`}
    >
      <FormControl fullWidth key={`${setting}-form`}>
        <InputLabel id="language">
          <FormattedMessage {...settingCardOptions.messages[setting]} />
        </InputLabel>
        <Select
          defaultValue={"es"}
          labelId={setting}
          id={setting}
          value={lang}
          label="language"
          onChange={handleChange}
          sx={{ width: 150 }}
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
