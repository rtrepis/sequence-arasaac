// Modal d'autenticació: embolcalla l'AuthForm (login) en un Dialog amb títol i
// botó de tancar. El registre viu a la seva pròpia pàgina (/:locale/signup).
import React, { useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { useIntl } from "react-intl";
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="auth-modal-title"
    >
      <DialogTitle id="auth-modal-title">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {intl.formatMessage(messages.loginTitle)}
          <IconButton
            onClick={onClose}
            aria-label={intl.formatMessage(messages.close)}
            size="small"
          >
            <AiOutlineClose />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <AuthForm onSuccess={onClose} onNavigateAway={onClose} autoFocus />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
