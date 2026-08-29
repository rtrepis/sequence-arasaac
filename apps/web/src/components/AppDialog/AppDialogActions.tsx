import React, { ReactElement, ReactNode } from "react";
import { DialogActions, Stack } from "@mui/material";
import { appDialogActions } from "./appDialog.styled";

interface AppDialogActionsProps {
  /**
   * Acció que queda **sola a l'esquerra**, separada de la resta per tota
   * l'amplada del diàleg. Hi va el que no és ni acceptar ni cancel·lar:
   * l'esborrat del modal d'edició (`outlined` i `error`) o la sortida que evita
   * la pèrdua d'un `ConfirmDialog` («Descarrega-ho abans»). L'app no té desfer:
   * aquí la protecció és la distància.
   */
  startAction?: ReactNode;
  /**
   * Tancar o cancel·lar i, a la seva dreta, l'acció principal (`contained`).
   * Sempre `StyledButton`, que és el botó de la casa.
   */
  children?: ReactNode;
}

/**
 * Peu canònic de tot diàleg de l'app. Vegeu
 * `docs/ESTANDARD-capes-flotants.md`.
 */
const AppDialogActions = ({
  startAction,
  children,
}: AppDialogActionsProps): ReactElement => (
  <DialogActions sx={appDialogActions(Boolean(startAction))}>
    {startAction}
    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
      {children}
    </Stack>
  </DialogActions>
);

export default AppDialogActions;
