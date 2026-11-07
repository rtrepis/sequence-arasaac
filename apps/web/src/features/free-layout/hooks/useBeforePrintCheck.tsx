import React, { useCallback, useId, useState } from "react";
import { DialogContentText } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "@/app/hooks";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { unplacedSequenceKeys } from "@features/free-layout/model/placementsOf";
import {
  selectPages,
  selectIsFreeLayout,
  selectSequenceKeys,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./useBeforePrintCheck.lang";

/** Què es vol fer després de l'avís: el botó diu una cosa o l'altra. */
export type PrintTarget = "print" | "pdf";

interface PendingPrint {
  target: PrintTarget;
  run: () => void;
}

/**
 * L'avís abans d'imprimir o de descarregar el PDF en mode lliure (ADR-005):
 * si hi ha seqüències que no surten a cap pàgina, o pàgines buides, es diu
 * abans, amb la xifra, i es tria si s'imprimeix igualment. Sense res a dir,
 * s'imprimeix directament: no es pregunta en va.
 *
 * No és una confirmació d'una acció destructiva (`ConfirmDialog`): imprimir no
 * esborra res. Per això és un `AppDialog` amb el botó principal de sempre.
 */
export const useBeforePrintCheck = (): {
  check: (target: PrintTarget, run: () => void) => void;
  dialog: React.ReactElement;
} => {
  const intl = useIntl();
  const titleId = useId();
  const bodyId = useId();
  const isFree = useAppSelector(selectIsFreeLayout);
  const freeLayout = useAppSelector(selectPages);
  const keys = useAppSelector(selectSequenceKeys);
  const [pending, setPending] = useState<PendingPrint | null>(null);

  const unplaced =
    isFree && freeLayout ? unplacedSequenceKeys(freeLayout, keys).length : 0;
  const emptyPages =
    isFree && freeLayout && freeLayout.common.length === 0
      ? freeLayout.sheets.flatMap((sheet, index) =>
          sheet.placements.length === 0 ? [index + 1] : [],
        )
      : [];

  const check = useCallback(
    (target: PrintTarget, run: () => void) => {
      if (unplaced === 0 && emptyPages.length === 0) run();
      else setPending({ target, run });
    },
    [unplaced, emptyPages.length],
  );

  const body = [
    unplaced > 0 && intl.formatMessage(messages.unplaced, { count: unplaced }),
    emptyPages.length > 0 &&
      intl.formatMessage(messages.emptyPages, {
        count: emptyPages.length,
        pages: intl.formatList(emptyPages.map(String), { type: "conjunction" }),
      }),
  ]
    .filter(Boolean)
    .join(" ");

  const close = () => setPending(null);

  const dialog = (
    <AppDialog
      open={pending !== null}
      onClose={close}
      title={intl.formatMessage(messages.title)}
      titleId={titleId}
      describedById={bodyId}
      maxWidth="xs"
      dividers={false}
      actions={
        <AppDialogActions>
          <StyledButton color="inherit" onClick={close}>
            {intl.formatMessage(messages.cancel)}
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={() => {
              const run = pending?.run;
              close();
              run?.();
            }}
          >
            {intl.formatMessage(
              pending?.target === "pdf"
                ? messages.downloadAnyway
                : messages.printAnyway,
            )}
          </StyledButton>
        </AppDialogActions>
      }
    >
      <DialogContentText id={bodyId}>{body}</DialogContentText>
    </AppDialog>
  );

  return { check, dialog };
};
