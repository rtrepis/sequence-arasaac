// Modal d'autenticació: login i registre en un sol component amb toggle.
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useIntl } from "react-intl";
import messages from "./AuthModal.lang";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { loginThunk, registerThunk } from "../store/authSlice";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = (): void => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setIsRegisterMode(false);
    onClose();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const thunk = isRegisterMode ? registerThunk : loginThunk;
    const result = await dispatch(thunk({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      handleClose();
    }
  };

  const title = isRegisterMode
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
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}

          <TextField
            label={intl.formatMessage(messages.email)}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoFocus
            autoComplete="email"
            disabled={isLoading}
          />

          <TextField
            label={intl.formatMessage(messages.password)}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete={isRegisterMode ? "new-password" : "current-password"}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={intl.formatMessage(messages.showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading || !email || !password}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isRegisterMode
              ? intl.formatMessage(messages.submitRegister)
              : intl.formatMessage(messages.submitLogin)}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={() => setIsRegisterMode((prev) => !prev)}
          >
            {isRegisterMode
              ? intl.formatMessage(messages.toggleToLogin)
              : intl.formatMessage(messages.toggleToRegister)}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
