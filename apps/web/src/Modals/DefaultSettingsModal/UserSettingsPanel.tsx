import { Stack } from "@mui/material";
import { FormattedMessage } from "react-intl";
import SettingCardLang from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardLangAppToggle from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLangAppToggle";
import SettingCardTheme from "../../components/SettingsCards/SettingCardTheme/SettingCardTheme";
import { SectionTitle } from "../../components/SettingsLayout";
import messages from "./UserSettingsPanel.lang";
import React from "react";

const UserSettingsPanel = (): React.ReactElement => (
  <Stack
    direction="column"
    gap={1}
    sx={{ pt: 1, maxWidth: 500, mx: "auto", width: "100%" }}
  >
    <SectionTitle title={<FormattedMessage {...messages.sectionLanguage} />}>
      <SettingCardLangAppToggle />
      <SettingCardLang setting="languagesSearch" />
    </SectionTitle>

    <SectionTitle title={<FormattedMessage {...messages.sectionAppearance} />}>
      <SettingCardTheme />
    </SectionTitle>
  </Stack>
);

export default UserSettingsPanel;
