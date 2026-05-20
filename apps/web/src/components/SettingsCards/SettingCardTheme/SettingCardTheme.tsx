import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { RiSunLine, RiMoonLine, RiComputerLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateThemeActionCreator } from "@features/user-settings/store/uiSlice";
import { ThemeMode } from "../../../types/ui";
import { card, cardContent } from "../SettingsCards.styled";
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

      <ToggleButtonGroup
        value={theme}
        exclusive
        onChange={handleChange}
        aria-label={intl.formatMessage(messages.ariaLabel)}
        sx={{
          ...cardContent,
          "& .MuiToggleButtonGroup-firstButton": { borderRadius: "10px 0 0 10px" },
          "& .MuiToggleButtonGroup-lastButton": { borderRadius: "0 10px 10px 0" },
        }}
      >
        {THEME_OPTIONS.map(({ value, icon, messageKey }) => (
          <ToggleButton
            key={value}
            value={value}
            aria-label={intl.formatMessage(messages[messageKey])}
            sx={{ width: 52, height: 52, flexDirection: "column", gap: 0.25, fontSize: "0.6rem" }}
          >
            {icon}
            <FormattedMessage {...messages[messageKey]} />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};

export default SettingCardTheme;
