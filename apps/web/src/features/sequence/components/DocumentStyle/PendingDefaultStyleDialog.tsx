// Un fitxer d'estil obert com si fos un document (`docs/fonaments/
// 06-compatibilitat-i-dades.md`, §6): es diu què és i es pregunta què se'n fa.
//
// - **Aplica'l a aquest document**: com «Carrega un estil», amb desfer. No hi
//   és si no hi ha cap document amb contingut: no tindria on aplicar-se.
// - **Fes-lo el meu estil per defecte**: substitueix el que l'usuari tenia, i
//   per això és una tria explícita, mai la que es fa per omissió.
// - **Cancel·la**: no en fa res.
//
// `AppDialog` atrapa el focus, es tanca amb Esc i té títol accessible.
import React from "react";
import { DialogContentText } from "@mui/material";
import { useIntl } from "react-intl";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import SettingsSaveErrorDialog from "@/Modals/DefaultSettingsModal/SettingsSaveErrorDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  changeDocumentStyleThunk,
  pendingDefaultStyleSetActionCreator,
} from "@features/sequence/store/styleSlice";
import { useSetDefaultStyle } from "@features/sequence/hooks/useSetDefaultStyle";
import { isPristineDocument } from "@features/sequence/utils/isPristineDocument";
import messages from "./DocumentStyle.lang";

const PendingDefaultStyleDialog = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) => state.style.pendingDefaultStyle);
  const canApply = useAppSelector(
    (state) => !isPristineDocument(state.document),
  );
  const { setAsDefault, retry, failure, isRetrying, dismissError } =
    useSetDefaultStyle();

  const handleCancel = () =>
    dispatch(pendingDefaultStyleSetActionCreator(null));

  const handleApply = () => {
    // L'avís del canvi, amb «Desfés», és el missatge d'aquesta acció
    if (pending) dispatch(changeDocumentStyleThunk(pending, "file"));
    handleCancel();
  };

  const handleMakeDefault = () => {
    if (pending) setAsDefault(pending);
    handleCancel();
  };

  const makeDefaultButton = (
    <StyledButton
      onClick={handleMakeDefault}
      variant={canApply ? "outlined" : "contained"}
      color={canApply ? "inherit" : "primary"}
    >
      {intl.formatMessage(messages.styleFileMakeDefault)}
    </StyledButton>
  );

  return (
    <>
      <AppDialog
        open={pending !== null}
        onClose={handleCancel}
        title={intl.formatMessage(messages.styleFileOpenedTitle)}
        titleId="style-file-opened-title"
        describedById="style-file-opened-body"
        maxWidth="xs"
        dividers={false}
        actions={
          <AppDialogActions startAction={canApply && makeDefaultButton}>
            {/* `inherit` i no el primary: el verd sobre el paper de
                configuració no es llegeix (F11) */}
            <StyledButton onClick={handleCancel} color="inherit">
              {intl.formatMessage(confirmMessages.cancel)}
            </StyledButton>
            {canApply ? (
              <StyledButton onClick={handleApply} variant="contained">
                {intl.formatMessage(messages.styleFileApply)}
              </StyledButton>
            ) : (
              makeDefaultButton
            )}
          </AppDialogActions>
        }
      >
        <DialogContentText id="style-file-opened-body">
          {intl.formatMessage(
            canApply
              ? messages.styleFileOpenedBody
              : messages.pendingDefaultBody,
          )}
        </DialogContentText>
      </AppDialog>
      <SettingsSaveErrorDialog
        failure={failure}
        isRetrying={isRetrying}
        onRetry={retry}
        onDismiss={dismissError}
      />
    </>
  );
};

export default PendingDefaultStyleDialog;
