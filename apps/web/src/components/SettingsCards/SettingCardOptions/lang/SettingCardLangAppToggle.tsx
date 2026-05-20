import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { langTranslateApp } from "../../../../configs/languagesConfigs";
import { LangsApp } from "../../../../types/ui";
import { card, cardContent } from "../../SettingsCards.styled";
import messages from "./SettingCardLangAppToggle.lang";
import React from "react";

const sortedLangs = [...langTranslateApp].sort();

const SettingCardLangAppToggle = (): React.ReactElement => {
  const { app: appLang, search: searchLang, keywords } = useAppSelector(
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
    dispatch(updateLangSettingsActionCreator({ app: value as LangsApp, search: searchLang, keywords }));
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
        sx={{
          ...cardContent,
          "& .MuiToggleButtonGroup-firstButton": { borderRadius: "10px 0 0 10px" },
          "& .MuiToggleButtonGroup-lastButton": { borderRadius: "0 10px 10px 0" },
        }}
      >
        {sortedLangs.map((lang) => (
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
