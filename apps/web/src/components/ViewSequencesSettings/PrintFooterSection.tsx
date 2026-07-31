import { TextField } from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { SectionTitle, SettingRow } from "@/components/SettingsLayout";
import messages from "./ViewSequencesSettings.lang";

interface PrintFooterSectionProps {
  author: string;
  onAuthorChange: (value: string) => void;
}

/**
 * Secció del peu d'impressió: l'autor de la seqüència, que només apareix al peu
 * del full imprès i del PDF (vegeu `CopyRight`). Va sempre al final de la columna
 * de configuració, perquè no afecta el que es veu a pantalla.
 */
const PrintFooterSection = ({
  author,
  onAuthorChange,
}: PrintFooterSectionProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <SectionTitle title={<FormattedMessage {...messages.sectionPrintFooter} />}>
      <SettingRow title={<FormattedMessage {...messages.authSequence} />}>
        <TextField
          value={author}
          onChange={(event) => onAuthorChange(event.target.value)}
          variant="filled"
          fullWidth
          helperText={intl.formatMessage(messages.authHelperText)}
          sx={{ ".MuiInputBase-input": { paddingTop: 2 } }}
        />
      </SettingRow>
    </SectionTitle>
  );
};

export default PrintFooterSection;
