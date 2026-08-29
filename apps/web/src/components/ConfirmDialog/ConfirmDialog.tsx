import { DialogContentText } from "@mui/material";
import React from "react";
import { useIntl } from "react-intl";
import messages from "./ConfirmDialog.lang";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";

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
   * «Descarrega-ho abans»). Va a la ranura de l'esquerra del peu: no és ni
   * acceptar ni cancel·lar, i allà queda separada per tota l'amplada del diàleg
   * de la que sí que consuma la pèrdua.
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
 * Aquí la destrucció **és** l'acció principal, i per això va a la dreta i
 * plena, no a la ranura de l'esquerra de l'estàndard.
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
    <AppDialog
      open={open}
      onClose={onCancel}
      title={title}
      titleId="confirm-dialog-title"
      describedById="confirm-dialog-body"
      maxWidth="xs"
      // Només porta una pregunta i el que es perd: sense estructura a dins, les
      // línies del contingut només hi afegirien pes
      dividers={false}
      actions={
        <AppDialogActions
          startAction={
            alternative && (
              // `inherit` també aquí: un `outlined` primary pinta el text i la
              // vora amb el verd de la casa, i sobre el paper es queda a 2,1:1
              <StyledButton
                onClick={alternative.onClick}
                variant="outlined"
                color="inherit"
              >
                {alternative.label}
              </StyledButton>
            )
          }
        >
          {/* `inherit` i no el primary: el verd de la casa sobre el paper de
              configuració es queda a 2,1:1 i no es llegeix (F11) */}
          <StyledButton onClick={onCancel} color="inherit">
            {intl.formatMessage(messages.cancel)}
          </StyledButton>
          <StyledButton onClick={onConfirm} color="error" variant="contained">
            {confirmLabel}
          </StyledButton>
        </AppDialogActions>
      }
    >
      <DialogContentText id="confirm-dialog-body">{body}</DialogContentText>
    </AppDialog>
  );
};

export default ConfirmDialog;
