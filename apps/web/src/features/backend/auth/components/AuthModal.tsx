// Modal d'autenticació: embolcalla l'AuthForm (login) en el diàleg de la casa.
// El registre viu a la seva pròpia pàgina (/:locale/signup).
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import messages from "./AuthModal.lang";
import AuthForm from "./AuthForm";
import { warmUpBackend } from "../../api/warmUpBackend";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps): React.ReactElement => {
  const intl = useIntl();

  // Obrir el formulari és el primer senyal clar que l'usuari vol el backend: mentre
  // escriu correu i contrasenya, el servidor de Render ja s'està despertant.
  useEffect(() => {
    if (open) void warmUpBackend();
  }, [open]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage(messages.loginTitle)}
      titleId="auth-modal-title"
      maxWidth="xs"
      // «Entra» es queda dins del formulari, que és on ha de ser: és el submit
      // del login, no l'acció del diàleg. El peu només en té la sortida.
      actions={
        <AppDialogActions>
          <StyledButton onClick={onClose} color="inherit">
            {intl.formatMessage(messages.close)}
          </StyledButton>
        </AppDialogActions>
      }
    >
      <AuthForm onSuccess={onClose} onNavigateAway={onClose} autoFocus />
    </AppDialog>
  );
};

export default AuthModal;
