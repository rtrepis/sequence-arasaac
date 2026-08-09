// Modal d'autenticació: embolcalla l'AuthForm en un Dialog amb títol i botó de tancar.
import React, { useState } from "react";
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
import AuthForm, { AuthMode } from "./AuthForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps): React.ReactElement => {
  const intl = useIntl();

  const [mode, setMode] = useState<AuthMode>("login");

  const handleClose = (): void => {
    setMode("login");
    onClose();
  };

  const title =
    mode === "register"
      ? intl.formatMessage(messages.registerTitle)
      : intl.formatMessage(messages.loginTitle);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          {title}
          <IconButton
            onClick={handleClose}
            aria-label={intl.formatMessage(messages.close)}
            size="small"
          >
            <AiOutlineClose />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <AuthForm
          mode={mode}
          onModeChange={setMode}
          onSuccess={handleClose}
          autoFocus
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
