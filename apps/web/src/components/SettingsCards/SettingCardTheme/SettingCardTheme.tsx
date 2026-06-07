import { Stack, ToggleButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { RiSunLine, RiMoonLine, RiComputerLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateThemeActionCreator } from "@features/user-settings/store/uiSlice";
import { ThemeMode } from "../../../types/ui";
import { card } from "../SettingsCards.styled";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import messages from "./SettingCardTheme.lang";
import React from "react";

const THEME_OPTIONS: { value: ThemeMode; icon: React.ReactNode; messageKey: keyof typeof messages }[] = [
  { value: "light", icon: <RiSunLine size={22} />, messageKey: "light" },
  { value: "system", icon: <RiComputerLine size={22} />, messageKey: "system" },
  { value: "dark", icon: <RiMoonLine size={22} />, messageKey: "dark" },
];

const SettingCardTheme = (): React.ReactElement => {
  const theme = useAppSelector((store) => store.ui.theme);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: ThemeMode | null,
  ) => {
    if (!value || value === theme) return;
    dispatch(updateThemeActionCreator(value));
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
        value={theme}
        exclusive
        onChange={handleChange}
        aria-label={intl.formatMessage(messages.ariaLabel)}
      >
        {THEME_OPTIONS.map(({ value, icon, messageKey }) => (
          <ToggleButton
            key={value}
            value={value}
            aria-label={intl.formatMessage(messages[messageKey])}
            selected={value === theme}
            sx={{ flexDirection: "column", gap: 0.25, fontSize: "0.6rem" }}
          >
            {icon}
            <FormattedMessage {...messages[messageKey]} />
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    </Stack>
  );
};

export default SettingCardTheme;
