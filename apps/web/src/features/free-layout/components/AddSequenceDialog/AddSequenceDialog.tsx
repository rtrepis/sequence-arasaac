import React, { useEffect, useId, useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { whereIs } from "@features/free-layout/model/placementsOf";
import {
  addSequencesToSheetThunk,
  selectDocumentContent,
  selectFreeLayout,
  selectSequenceKeys,
} from "@features/free-layout/store/freeLayoutThunks";
import { useSequenceName } from "@features/free-layout/components/FreeLayoutPages/useSequenceName";
import messages from "./AddSequenceDialog.lang";

interface AddSequenceDialogProps {
  /** La pàgina on s'afegeixen; `null`, tancat */
  sheetIndex: number | null;
  onClose: () => void;
}

/**
 * «+ Afegeix una seqüència»: totes les seqüències del document, amb on surt ja
 * cadascuna, per triar-ne les que van a aquesta pàgina. Afegir-ne una no la
 * treu d'on era: en fa una col·locació nova (ADR-005). Primer surten les que
 * no són a cap pàgina, que és el que es busca gairebé sempre.
 *
 * La pàgina es torna a repartir amb la plantilla que toca, i surt el snackbar
 * amb «Desfés»: és la confirmació de l'acció.
 */
const AddSequenceDialog = ({
  sheetIndex,
  onClose,
}: AddSequenceDialogProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const titleId = useId();
  const hintId = useId();
  const sequenceName = useSequenceName();
  const keys = useAppSelector(selectSequenceKeys);
  const content = useAppSelector(selectDocumentContent);
  const freeLayout = useAppSelector(selectFreeLayout);
  const [chosen, setChosen] = useState<number[]>([]);
  const [nothingChosen, setNothingChosen] = useState(false);
  const open = sheetIndex !== null;

  // Cada vegada que s'obre, sense res triat
  useEffect(() => {
    if (open) {
      setChosen([]);
      setNothingChosen(false);
    }
  }, [open]);

  const whereabouts = (key: number): string => {
    if (!freeLayout) return intl.formatMessage(messages.unplaced);
    const { common, sheets } = whereIs(freeLayout, key);
    if (common) return intl.formatMessage(messages.onEveryPage);
    if (sheets.length === 0) return intl.formatMessage(messages.unplaced);
    return intl.formatMessage(messages.onPages, {
      count: sheets.length,
      pages: intl.formatList(
        sheets.map((index) => String(index + 1)),
        {
          type: "conjunction",
        },
      ),
    });
  };

  // Primer les que no surten enlloc; dins de cada grup, l'ordre de les pestanyes
  const ordered = [...keys].sort((a, b) => {
    const placed = (key: number) => {
      if (!freeLayout) return 0;
      const { common, sheets } = whereIs(freeLayout, key);
      return common || sheets.length > 0 ? 1 : 0;
    };
    return placed(a) - placed(b) || keys.indexOf(a) - keys.indexOf(b);
  });

  const toggle = (key: number) => {
    setNothingChosen(false);
    setChosen((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  };

  const handleAdd = () => {
    if (sheetIndex === null) return;
    if (chosen.length === 0) {
      setNothingChosen(true);
      return;
    }
    // En l'ordre de les pestanyes, no en el que s'han clicat
    dispatch(
      addSequencesToSheetThunk(
        sheetIndex,
        keys.filter((key) => chosen.includes(key)),
      ),
    );
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage(messages.title, {
        number: (sheetIndex ?? 0) + 1,
      })}
      titleId={titleId}
      describedById={hintId}
      actions={
        <AppDialogActions>
          <StyledButton color="inherit" onClick={onClose}>
            {intl.formatMessage(messages.cancel)}
          </StyledButton>
          <StyledButton variant="contained" onClick={handleAdd}>
            {intl.formatMessage(messages.add)}
          </StyledButton>
        </AppDialogActions>
      }
    >
      <Typography id={hintId} variant="body2" sx={{ marginBottom: 1 }}>
        {intl.formatMessage(messages.hint)}
      </Typography>
      <FormGroup>
        {ordered.map((key) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={chosen.includes(key)}
                onChange={() => toggle(key)}
              />
            }
            label={
              <>
                <Typography component="span" display="block">
                  {sequenceName(key)}
                </Typography>
                <Typography
                  component="span"
                  display="block"
                  variant="body2"
                  color="text.secondary"
                >
                  {intl.formatMessage(messages.pictograms, {
                    count: content[key]?.length ?? 0,
                  })}
                  {" · "}
                  {whereabouts(key)}
                </Typography>
              </>
            }
          />
        ))}
      </FormGroup>
      {nothingChosen && (
        <Typography role="alert" color="error" variant="body2">
          {intl.formatMessage(messages.nothingChosen)}
        </Typography>
      )}
    </AppDialog>
  );
};

export default AddSequenceDialog;
