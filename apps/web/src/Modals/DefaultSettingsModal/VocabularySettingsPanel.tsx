import { Box, Typography } from "@mui/material";
import { FormattedMessage, defineMessages } from "react-intl";
import React from "react";

const messages = defineMessages({
  comingSoon: {
    id: "components.defaultSettings.vocabularyPanel.comingSoon",
    defaultMessage: "Coming soon",
    description: "Missatge de pròximament al panel de vocabulari personal",
  },
  description: {
    id: "components.defaultSettings.vocabularyPanel.description",
    defaultMessage: "Here you will be able to assign a specific pictogram to any word.",
    description: "Descripció del panel de vocabulari personal",
  },
});

const VocabularySettingsPanel = (): React.ReactElement => (
  <Box sx={{ pt: 4, textAlign: "center" }}>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      <FormattedMessage {...messages.comingSoon} />
    </Typography>
    <Typography variant="body2" color="text.secondary">
      <FormattedMessage {...messages.description} />
    </Typography>
  </Box>
);

export default VocabularySettingsPanel;
