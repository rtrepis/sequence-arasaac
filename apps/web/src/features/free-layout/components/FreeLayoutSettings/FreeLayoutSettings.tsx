import React from "react";
import { Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import StyledButton from "@/style/StyledButton";
import { SectionTitle, SettingRow } from "@/components/SettingsLayout";
import { unplacedSequenceKeys } from "@features/free-layout/model/placementsOf";
import {
  addSequencesToSheetThunk,
  selectPages,
  selectSequenceKeys,
} from "@features/free-layout/store/freeLayoutThunks";
import { useViewSelection } from "@features/free-layout/hooks/useViewSelection";
import { useSequenceName } from "@features/free-layout/components/FreeLayoutPages/useSequenceName";
import levelMessages from "@features/free-layout/components/ViewLevels/ViewLevels.lang";
import messages from "./FreeLayoutSettings.lang";

/**
 * Les seqüències que no surten a cap pàgina, al nivell «Document» de la
 * columna de la vista: cadascuna amb el botó que la posa a la pàgina que
 * segueix la columna (es pot desfer). No s'imprimeixen. Sense pàgines (un
 * document com els de sempre) o sense cap seqüència fora, no hi és.
 */
const FreeLayoutSettings = (): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const keys = useAppSelector(selectSequenceKeys);
  const pages = useAppSelector(selectPages);
  const sequenceName = useSequenceName();
  const { activePage } = useViewSelection();
  const unplaced = pages ? unplacedSequenceKeys(pages, keys) : [];
  if (unplaced.length === 0) return null;

  return (
    <SectionTitle title={<FormattedMessage {...messages.unplaced} />}>
      <Typography variant="caption" color="text.secondary">
        <FormattedMessage {...messages.unplacedHint} />
      </Typography>
      {unplaced.map((key) => {
        const name = sequenceName(key);
        return (
          <SettingRow key={key} title={name} control="compact">
            <StyledButton
              color="inherit"
              aria-label={intl.formatMessage(levelMessages.putOnPageLabel, {
                name,
                number: activePage + 1,
              })}
              onClick={() =>
                dispatch(addSequencesToSheetThunk(activePage, [key]))
              }
            >
              {intl.formatMessage(levelMessages.putOnPage, {
                number: activePage + 1,
              })}
            </StyledButton>
          </SettingRow>
        );
      })}
    </SectionTitle>
  );
};

export default FreeLayoutSettings;
