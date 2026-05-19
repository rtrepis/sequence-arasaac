import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { saveLangSettings } from "../../../../features/user-settings/storage/settingsStorage";
import { langTranslateApp } from "../../../../configs/languagesConfigs";
import { LangsApp } from "../../../../types/ui";
import { card, cardContent } from "../../SettingsCards.styled";
import messages from "./SettingCardLangAppToggle.lang";
import React from "react";

const SettingCardLangAppToggle = (): React.ReactElement => {
  const { app: appLang, search: searchLang } = useAppSelector(
    (store) => store.ui.lang,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const intl = useIntl();

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: string | null,
  ) => {
    if (!value || value === appLang) return;

    const newLangValue = { app: value as LangsApp, search: searchLang };
    dispatch(updateLangSettingsActionCreator(newLangValue));
    saveLangSettings(newLangValue);
    navigate(`../../${value}/create-sequence`);
  };

  return (
    <Stack
      display="flex"
      direction="row"
      flexWrap="wrap"
      columnGap={2}
      sx={{ ...card, borderBottom: 0, width: "100%" }}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold", flex: 1 }} component="h2">
        <FormattedMessage {...messages.cardTitle} />
      </Typography>

      <ToggleButtonGroup
        value={appLang}
        exclusive
        onChange={handleChange}
        aria-label={intl.formatMessage(messages.ariaLabel)}
        sx={cardContent}
      >
        {langTranslateApp.map((lang) => (
          <ToggleButton
            key={lang}
            value={lang}
            aria-label={lang}
            sx={{ width: 44, height: 44 }}
          >
            {lang.toUpperCase()}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};

export default SettingCardLangAppToggle;
