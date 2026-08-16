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
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./SettingsSaveErrorDialog.lang";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import {
  RequestFailure,
  STORAGE_FULL,
} from "@features/backend/api/requestFailure";

const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.accessToken !== null;

interface SettingsSaveErrorDialogProps {
  /** Fallada que ha de descriure el diàleg; null el manté tancat. */
  failure: RequestFailure | null;
  isRetrying: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

const SettingsSaveErrorDialog = ({
  failure,
  isRetrying,
  onRetry,
  onDismiss,
}: SettingsSaveErrorDialogProps): React.ReactElement => {
  const intl = useIntl();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // El que s'ha perdut no és el mateix segons on s'havia de desar, i dir-ho malament
  // seria pitjor que no dir res. L'espai exhaurit del navegador té text propi perquè
  // és l'únic cas on l'usuari pot fer alguna cosa concreta per resoldre-ho.
  const body =
    failure?.code === STORAGE_FULL
      ? messages.bodyStorageFull
      : isAuthenticated
        ? messages.bodyCloud
        : messages.bodyLocal;

  // Insistir no arregla un navegador ple ni unes dades que el servidor rebutja
  const canRetry = failure?.code !== STORAGE_FULL;

  return (
    <Dialog
      open={failure !== null}
      onClose={onDismiss}
      maxWidth="xs"
      aria-labelledby="settings-save-error-title"
    >
      <DialogTitle id="settings-save-error-title">
        {intl.formatMessage(messages.title)}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>{intl.formatMessage(body)}</DialogContentText>

        {/* El codi, discret i al peu: no li diu res a qui només vol treballar, i
            estalvia una sessió de depuració a qui ha de mirar què ha passat */}
        {failure && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            {intl.formatMessage(messages.errorCode, { code: failure.code })}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onDismiss} disabled={isRetrying}>
          {intl.formatMessage(canRetry ? messages.dismiss : messages.understood)}
        </Button>
        {canRetry && (
          <Button
            onClick={onRetry}
            variant="contained"
            disabled={isRetrying}
            startIcon={isRetrying ? <CircularProgress size={16} /> : null}
          >
            {intl.formatMessage(messages.retry)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SettingsSaveErrorDialog;
