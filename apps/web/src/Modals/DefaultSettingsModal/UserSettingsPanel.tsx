import { Divider, Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import SettingCardLang from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardLangAppToggle from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLangAppToggle";
import messages from "./UserSettingsPanel.lang";
import React from "react";

const searchCardSx = { borderBottom: 0, width: "100%" };

const UserSettingsPanel = (): React.ReactElement => (
  <Stack
    direction="column"
    gap={1}
    sx={{ pt: 1, maxWidth: 500, mx: "auto", width: "100%" }}
  >
    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
      <FormattedMessage {...messages.sectionLanguage} />
    </Typography>
    <Divider />

    <SettingCardLangAppToggle />
    <SettingCardLang setting="languagesSearch" sx={searchCardSx} />
  </Stack>
);

export default UserSettingsPanel;
