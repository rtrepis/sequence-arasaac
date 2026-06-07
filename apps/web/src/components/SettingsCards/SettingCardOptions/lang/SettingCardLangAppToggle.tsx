import { Stack, ToggleButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { langTranslateApp } from "../../../../configs/languagesConfigs";
import { LangsApp } from "../../../../types/ui";
import { card } from "../../SettingsCards.styled";
import StyledToggleButtonGroup from "../../../../style/StyledToggleButtonGroup";
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

      <StyledToggleButtonGroup
        value={appLang}
        exclusive
        onChange={handleChange}
        aria-label={intl.formatMessage(messages.ariaLabel)}
      >
        {sortedLangs.map((lang) => (
          <ToggleButton
            key={lang}
            value={lang}
            aria-label={lang}
            selected={lang === appLang}
          >
            {lang.toUpperCase()}
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    </Stack>
  );
};

export default SettingCardLangAppToggle;
