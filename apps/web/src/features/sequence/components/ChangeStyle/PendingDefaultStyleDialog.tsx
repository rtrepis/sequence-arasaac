// Fitxer d'estil obert sense cap seqüència a què aplicar-lo: es pregunta si es
// vol fer servir per defecte (fonaments, punt 3). És una confirmació perquè
// substitueix l'estil per defecte que l'usuari ja tenia.
import React from "react";
import { useIntl } from "react-intl";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import SettingsSaveErrorDialog from "@/Modals/DefaultSettingsModal/SettingsSaveErrorDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { pendingDefaultStyleSetActionCreator } from "@features/sequence/store/styleSlice";
import { useSetDefaultStyle } from "@features/sequence/hooks/useSetDefaultStyle";
import messages from "./ChangeStyle.lang";

const PendingDefaultStyleDialog = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) => state.style.pendingDefaultStyle);
  const { setAsDefault, retry, failure, isRetrying, dismissError } =
    useSetDefaultStyle();

  const handleCancel = () =>
    dispatch(pendingDefaultStyleSetActionCreator(null));

  const handleConfirm = () => {
    if (pending) setAsDefault(pending);
    handleCancel();
  };

  return (
    <>
      <ConfirmDialog
        open={pending !== null}
        title={intl.formatMessage(messages.pendingDefaultTitle)}
        body={intl.formatMessage(messages.pendingDefaultBody)}
        confirmLabel={intl.formatMessage(messages.pendingDefaultConfirm)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
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
