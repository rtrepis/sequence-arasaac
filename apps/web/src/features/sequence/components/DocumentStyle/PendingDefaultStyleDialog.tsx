// Un fitxer d'estil obert com si fos un document (`docs/fonaments/
// 06-compatibilitat-i-dades.md`, §6): es diu què és i es pregunta si es fa el
// meu estil.
//
// - **Fes-lo el meu estil**: substitueix el que l'usuari tenia, i per això és
//   una tria explícita, mai la que es fa per omissió.
// - **Cancel·la**: no en fa res.
//
// No s'aplica mai al document obert: els estils van en una sola direcció, de
// la configuració cap al document, i al document s'hi porta des del menú «⋯» de
// la pàgina o del bloc (R10).
//
// `AppDialog` atrapa el focus, es tanca amb Esc i té títol accessible.
import React from "react";
import { DialogContentText } from "@mui/material";
import { useIntl } from "react-intl";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import SettingsSaveErrorDialog from "@features/backend/user-settings/components/SettingsSaveErrorDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { pendingDefaultStyleSetActionCreator } from "@features/sequence/store/styleSlice";
import { useSetDefaultStyle } from "@features/sequence/hooks/useSetDefaultStyle";
import messages from "./DocumentStyle.lang";

const PendingDefaultStyleDialog = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) => state.style.pendingDefaultStyle);
  const { setAsDefault, retry, failure, isRetrying, dismissError } =
    useSetDefaultStyle();

  const handleCancel = () =>
    dispatch(pendingDefaultStyleSetActionCreator(null));

  const handleMakeDefault = () => {
    if (pending) setAsDefault(pending);
    handleCancel();
  };

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
          <AppDialogActions>
            {/* `inherit` i no el primary: el verd sobre el paper de
                configuració no es llegeix (F11) */}
            <StyledButton onClick={handleCancel} color="inherit">
              {intl.formatMessage(confirmMessages.cancel)}
            </StyledButton>
            <StyledButton onClick={handleMakeDefault} variant="contained">
              {intl.formatMessage(messages.styleFileMakeDefault)}
            </StyledButton>
          </AppDialogActions>
        }
      >
        <DialogContentText id="style-file-opened-body">
          {intl.formatMessage(messages.styleFileOpenedBody)}
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
