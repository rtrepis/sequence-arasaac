// Formulari d'autenticació (login / registre) reutilitzable:
// s'usa dins l'AuthModal i incrustat al panell de vocabulari personal.
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useIntl } from "react-intl";
import messages from "./AuthModal.lang";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { loginThunk, registerThunk } from "../store/authSlice";

export type AuthMode = "login" | "register";

interface AuthFormProps {
  /** Mode actiu del formulari. El controla el contenidor perquè pugui titular-se. */
  mode: AuthMode;
  /** Canvi de mode des de l'enllaç inferior del formulari. */
  onModeChange: (mode: AuthMode) => void;
  /** Acció posterior a una autenticació correcta (tancar el modal, per exemple). */
  onSuccess?: () => void;
  /** Posa el focus al camp de correu en muntar-se. Només té sentit en un modal. */
  autoFocus?: boolean;
}

const AuthForm = ({
  mode,
  onModeChange,
  onSuccess,
  autoFocus = false,
}: AuthFormProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isLoading, errorCode } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isRegisterMode = mode === "register";

  // Tradueix el codi d'error del backend al missatge de l'idioma actiu
  const errorMessage = errorCode
    ? intl.formatMessage(
        messages[errorCode as keyof typeof messages] ?? messages.UNKNOWN_ERROR,
      )
    : null;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const thunk = isRegisterMode ? registerThunk : loginThunk;
    const result = await dispatch(thunk({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      onSuccess?.();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
    >
      {errorMessage && (
        <Alert severity="error" variant="outlined">
          {errorMessage}
        </Alert>
      )}

      <TextField
        label={intl.formatMessage(messages.email)}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        autoFocus={autoFocus}
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
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
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
        onClick={() => onModeChange(isRegisterMode ? "login" : "register")}
      >
        {isRegisterMode
          ? intl.formatMessage(messages.toggleToLogin)
          : intl.formatMessage(messages.toggleToRegister)}
      </Typography>
    </Box>
  );
};

export default AuthForm;
