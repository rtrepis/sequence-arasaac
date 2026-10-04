import { Switch, TextField, Tooltip } from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { SectionTitle, SettingRow } from "@/components/SettingsLayout";
import messages from "./ViewSequencesSettings.lang";

const AUTHOR_LABEL_ID = "print-footer-author-label";
const LICENCE_LABEL_ID = "print-footer-licence-label";

interface PrintFooterSectionProps {
  author: string;
  onAuthorChange: (value: string) => void;
  /** Sense valor, la llicència hi va: és el que fa el que ja estigui desat. */
  licence?: boolean;
  onLicenceChange: (value: boolean) => void;
}

/**
 * Secció del peu d'impressió: la llicència dels pictogrames i l'autor de la
 * seqüència, que són l'únic que apareix al peu del full (vegeu `CopyRight`).
 * Va sempre al final de la columna de configuració, perquè és el que menys
 * s'ajusta.
 */
const PrintFooterSection = ({
  author,
  onAuthorChange,
  licence,
  onLicenceChange,
}: PrintFooterSectionProps): React.ReactElement => {
  const intl = useIntl();

  // Amb autor, la llicència hi va sempre: qui signa la seqüència ha de dir
  // també d'on són els pictogrames, que no són seus
  const forcedByAuthor = author.trim().length > 0;
  const checked = forcedByAuthor || licence !== false;

  return (
    <SectionTitle title={<FormattedMessage {...messages.sectionPrintFooter} />}>
      <SettingRow
        title={<FormattedMessage {...messages.licence} />}
        labelId={LICENCE_LABEL_ID}
        control="compact"
      >
        {/* El motiu va al tooltip i, sobretot, a `aria-describedby`: amb autor
            l'interruptor es queda encès i no respon, i qui el prem mereix
            saber per què sense haver d'endevinar-ho */}
        <Tooltip
          title={intl.formatMessage(
            forcedByAuthor ? messages.licenceForcedHelper : messages.licenceHelper,
          )}
          describeChild
        >
          <Switch
            checked={checked}
            inputProps={{
              "aria-labelledby": LICENCE_LABEL_ID,
              // `aria-disabled` i no `disabled`: un control desactivat surt de
              // l'ordre de tabulació i qui hi navega amb teclat el perd de sota
              // els dits sense cap avís. Va a l'`input`, que és qui porta el
              // rol: al `span` de fora, cap lector de pantalla no el llegiria
              "aria-disabled": forcedByAuthor || undefined,
            }}
            onChange={(_, value) => {
              if (forcedByAuthor) return;
              onLicenceChange(value);
            }}
          />
        </Tooltip>
      </SettingRow>

      <SettingRow
        title={<FormattedMessage {...messages.authSequence} />}
        labelId={AUTHOR_LABEL_ID}
      >
        <TextField
          value={author}
          onChange={(event) => onAuthorChange(event.target.value)}
          variant="filled"
          fullWidth
          inputProps={{ "aria-labelledby": AUTHOR_LABEL_ID }}
          helperText={intl.formatMessage(messages.authHelperText)}
          sx={{ ".MuiInputBase-input": { paddingTop: 2 } }}
        />
      </SettingRow>
    </SectionTitle>
  );
};

export default PrintFooterSection;
