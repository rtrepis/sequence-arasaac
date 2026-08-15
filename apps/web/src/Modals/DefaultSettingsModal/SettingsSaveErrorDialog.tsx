// Diàleg que explica que la configuració no s'ha pogut desar i ofereix reintentar-ho.
//
// És un diàleg i no un snackbar perquè arriba quan l'usuari ja ha tancat el modal i ja
// no pensa en la configuració: cal dir-li què ha passat, què s'hi juga i què pot fer,
// i això no cap en un avís que marxa sol al cap de tres segons.
import React from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./SettingsSaveErrorDialog.lang";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";

const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.accessToken !== null;

interface SettingsSaveErrorDialogProps {
  open: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

const SettingsSaveErrorDialog = ({
  open,
  isRetrying,
  onRetry,
  onDismiss,
}: SettingsSaveErrorDialogProps): React.ReactElement => {
  const intl = useIntl();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // El que s'ha perdut no és el mateix segons on s'havia de desar, i dir-ho malament
  // seria pitjor que no dir res: qui no té sessió no ha de patir per cap servidor.
  const body = isAuthenticated ? messages.bodyCloud : messages.bodyLocal;

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      maxWidth="xs"
      aria-labelledby="settings-save-error-title"
    >
      <DialogTitle id="settings-save-error-title">
        {intl.formatMessage(messages.title)}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>{intl.formatMessage(body)}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onDismiss} disabled={isRetrying}>
          {intl.formatMessage(messages.dismiss)}
        </Button>
        <Button
          onClick={onRetry}
          variant="contained"
          disabled={isRetrying}
          startIcon={isRetrying ? <CircularProgress size={16} /> : null}
        >
          {intl.formatMessage(messages.retry)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsSaveErrorDialog;
