import React from "react";
import { MenuItem, Select } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { LicenceOn } from "@/types/document";
import { SettingRow } from "@/components/SettingsLayout";
import {
  selectPages,
  setLicenceOnThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./ViewLevels.lang";

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-document-licence-on";

/**
 * A quines pàgines va el peu de llicència: a totes o només a l'última. És del
 * document (es desa amb les pàgines). Amb una sola pàgina no hi ha res a
 * triar, i no hi és.
 */
const LicencePagesRow = (): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);
  if (!pages || pages.sheets.length < 2) return null;

  return (
    <SettingRow
      title={<FormattedMessage {...messages.licenceOn} />}
      labelId={LABEL_ID}
    >
      <Select<LicenceOn>
        value={pages.licenceOn ?? "every"}
        onChange={(event) =>
          dispatch(setLicenceOnThunk(event.target.value as LicenceOn))
        }
        size="small"
        fullWidth
        labelId={LABEL_ID}
      >
        <MenuItem value="every">
          {intl.formatMessage(messages.licenceOnEvery)}
        </MenuItem>
        <MenuItem value="last">
          {intl.formatMessage(messages.licenceOnLast)}
        </MenuItem>
      </Select>
    </SettingRow>
  );
};

export default LicencePagesRow;
