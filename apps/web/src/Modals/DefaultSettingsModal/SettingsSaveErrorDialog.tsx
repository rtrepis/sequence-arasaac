// Diàleg que explica que la configuració no s'ha pogut desar i ofereix reintentar-ho.
//
// És un diàleg i no un snackbar perquè arriba quan l'usuari ja ha tancat el modal i ja
// no pensa en la configuració: cal dir-li què ha passat, què s'hi juga i què pot fer,
// i això no cap en un avís que marxa sol al cap de tres segons.
import React from "react";
import { CircularProgress, DialogContentText, Typography } from "@mui/material";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useIntl } from "react-intl";
import messages from "./SettingsSaveErrorDialog.lang";
import { useAppSelector } from "../../app/hooks";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
import {
  RequestFailure,
  STORAGE_FULL,
} from "@features/backend/api/requestFailure";

/** Rebutjos per quota del compte: cap d'ells canvia per tornar-ho a provar. */
const QUOTA_CODES = new Set([
  "QUOTA_STORAGE_EXCEEDED",
  "QUOTA_DOCUMENTS_EXCEEDED",
  "QUOTA_WORD_PROFILES_EXCEEDED",
]);

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
  const isAuthenticated = useAppSelector(selectIsLoggedIn);

  // El que s'ha perdut no és el mateix segons on s'havia de desar, i dir-ho malament
  // seria pitjor que no dir res. Els casos amb text propi són aquells on l'usuari
  // pot fer alguna cosa concreta: l'espai del navegador exhaurit, el del compte, i
  // una imatge que passa del pes màxim.
  const body = (() => {
    if (failure?.code === STORAGE_FULL) return messages.bodyStorageFull;
    if (failure?.code === "IMAGE_TOO_LARGE") return messages.bodyImageTooLarge;
    if (failure && QUOTA_CODES.has(failure.code)) return messages.bodyQuota;
    return isAuthenticated ? messages.bodyCloud : messages.bodyLocal;
  })();

  // Insistir no arregla un navegador ple, un compte sense espai ni unes dades que
  // el servidor rebutja: el botó de reintentar només hi és quan pot canviar alguna
  // cosa, i oferir-lo quan no serviria de res només fa perdre el temps
  const canRetry =
    failure !== null &&
    failure.code !== STORAGE_FULL &&
    failure.code !== "IMAGE_TOO_LARGE" &&
    !QUOTA_CODES.has(failure.code);

  return (
    <AppDialog
      open={failure !== null}
      onClose={onDismiss}
      title={intl.formatMessage(messages.title)}
      titleId="settings-save-error-title"
      maxWidth="xs"
      dividers={false}
      actions={
        <AppDialogActions>
          <StyledButton
            onClick={onDismiss}
            color="inherit"
            disabled={isRetrying}
          >
            {intl.formatMessage(
              canRetry ? messages.dismiss : messages.understood,
            )}
          </StyledButton>
          {canRetry && (
            <StyledButton
              onClick={onRetry}
              variant="contained"
              disabled={isRetrying}
              startIcon={isRetrying ? <CircularProgress size={16} /> : null}
            >
              {intl.formatMessage(messages.retry)}
            </StyledButton>
          )}
        </AppDialogActions>
      }
    >
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
    </AppDialog>
  );
};

export default SettingsSaveErrorDialog;
