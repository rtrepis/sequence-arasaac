import { ToggleButton } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { LANGS_APP } from "@sequence-arasaac/i18n";
import { LangsApp } from "../../../../types/ui";
import SettingRow from "../../../SettingsLayout/SettingRow";
import StyledToggleButtonGroup from "../../../../style/StyledToggleButtonGroup";
import messages from "./SettingCardLangAppToggle.lang";
import {
  pathInLocale,
  useCurrentLocale,
} from "@features/user-settings/hooks/useCurrentLocale";
import React from "react";

const sortedLangs = [...LANGS_APP].sort();

const SettingCardLangAppToggle = (): React.ReactElement => {
  const searchLang = useAppSelector((store) => store.ui.lang.search);
  // El que es veu és l'idioma de la URL, que és el que mana (B23): el marcat i
  // el que no cal tornar a triar
  const currentLang = useCurrentLocale();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const intl = useIntl();

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: string | null,
  ) => {
    if (!value || value === currentLang) return;
    const lang = value as LangsApp;
    // Queda com a idioma de la sessió (es desa amb les preferències, si l'usuari
    // les desa) i la pàgina passa a aquest idioma sense moure's d'on és
    dispatch(
      updateLangSettingsActionCreator({ app: lang, search: searchLang }),
    );
    navigate(`${pathInLocale(pathname, lang)}${search}${hash}`);
  };

  return (
    <SettingRow
      title={<FormattedMessage {...messages.cardTitle} />}
      control="wide"
    >
      <StyledToggleButtonGroup
        value={currentLang}
        exclusive
        onChange={handleChange}
        aria-label={intl.formatMessage(messages.ariaLabel)}
      >
        {sortedLangs.map((lang) => (
          <ToggleButton
            key={lang}
            value={lang}
            aria-label={lang}
            selected={lang === currentLang}
          >
            {lang.toUpperCase()}
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    </SettingRow>
  );
};

export default SettingCardLangAppToggle;
