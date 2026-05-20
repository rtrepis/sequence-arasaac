import { Divider, Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import SettingCardLang from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardLangAppToggle from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLangAppToggle";
import SettingCardTheme from "../../components/SettingsCards/SettingCardTheme/SettingCardTheme";
import messages from "./UserSettingsPanel.lang";
import React from "react";

const searchCardSx = { borderBottom: 0, width: "100%" };

const SectionTitle = ({ message }: { message: (typeof messages)[keyof typeof messages] }) => (
  <Stack direction="column" gap={0.5}>
    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
      <FormattedMessage {...message} />
    </Typography>
    <Divider />
  </Stack>
);

const UserSettingsPanel = (): React.ReactElement => (
  <Stack
    direction="column"
    gap={1}
    sx={{ pt: 1, maxWidth: 500, mx: "auto", width: "100%" }}
  >
    <SectionTitle message={messages.sectionLanguage} />
    <SettingCardLangAppToggle />
    <SettingCardLang setting="languagesSearch" sx={searchCardSx} />

    <SectionTitle message={messages.sectionAppearance} />
    <SettingCardTheme />
  </Stack>
);

export default UserSettingsPanel;
