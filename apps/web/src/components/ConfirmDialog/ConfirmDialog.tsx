import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { useIntl } from "react-intl";
import messages from "./ConfirmDialog.lang";

interface ConfirmDialogProps {
  open: boolean;
  /** Pregunta, no advertència: «Esborres la seqüència 3?» */
  title: string;
  /** Què es perd exactament, en concret i sense eufemismes */
  body: string;
  /** Text del botó que fa l'acció destructiva */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * Sortida que evita la pèrdua en comptes de consumar-la (p. ex.
   * «Descarrega-ho abans»). Va al mig: no és ni acceptar ni cancel·lar.
   */
  alternative?: { label: string; onClick: () => void };
}

/**
 * Confirmació única de tota l'app per a una acció que destrueix feina i que no
 * es pot desfer: `features/sequence` no té cap `undo`, així que aquest diàleg
 * és l'única xarxa que hi ha.
 *
 * Ha de ser un sol component perquè el que decideix si una acció s'ha de
 * confirmar és **quant costa refer-la**, i aquest criteri s'ha de poder llegir
 * en un sol lloc.
 *
 * El focus inicial se'l queda el diàleg, no cap botó (comportament de MUI,
 * comprovat). És el que convé aquí per dues raons: el lector de pantalla llegeix
 * el títol i el cos —`aria-labelledby` i `aria-describedby`—, que és justament
 * el que s'ha de llegir abans de decidir; i cap botó no queda armat, així que
 * Enter no consuma res. Per això el botó destructiu no porta `autoFocus`: no
 * s'ha d'afegir mai.
 */
const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  alternative,
}: ConfirmDialogProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-body"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-body">{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          {intl.formatMessage(messages.cancel)}
        </Button>
        {alternative && (
          <Button onClick={alternative.onClick}>{alternative.label}</Button>
        )}
        <Button onClick={onConfirm} color="error" variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
