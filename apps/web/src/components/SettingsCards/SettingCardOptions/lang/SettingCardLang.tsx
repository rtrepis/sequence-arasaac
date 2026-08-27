import {
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import SettingRow from "../../../SettingsLayout/SettingRow";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { settingCardOptions } from "./SettingCardLang.lang";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { langTranslateApp, langTranslateSearch } from "../../../../configs/languagesConfigs";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { LangsApp } from "../../../../types/ui";

interface SettingCardProps {
  setting: "languagesApp" | "languagesSearch";
}

const SettingCardLang = ({ setting }: SettingCardProps): React.ReactElement => {
  const { app: appLang, search: searchLang } = useAppSelector(
    (store) => store.ui.lang,
  );
  const dispatch = useAppDispatch();

  const [lang, setLang] = useState(setting === "languagesApp" ? appLang : searchLang);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setLang(value);

    // Les keywords no van al payload: si canvia l'idioma de cerca, useArasaacKeywords
    // les torna a demanar i les substitueix ell mateix
    dispatch(updateLangSettingsActionCreator({
      app: setting === "languagesApp" ? value as LangsApp : appLang,
      search: setting === "languagesSearch" ? value : searchLang,
    }));
  };

  const labelId = `setting-lang-${setting}-label`;

  return (
    <SettingRow
      title={<FormattedMessage {...settingCardOptions.messages[setting]} />}
      labelId={labelId}
    >
      <Select
        id={setting}
        value={lang}
        onChange={handleChange}
        fullWidth
        sx={{ borderRadius: "10px" }}
        labelId={labelId}
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
    </SettingRow>
  );
};

export default SettingCardLang;
