// Formulari de login reutilitzable: s'usa dins l'AuthModal i incrustat al
// panell de vocabulari personal. El registre viu a la seva pròpia pàgina
// (/:locale/signup) — aquí només queden l'enllaç cap a ella i el d'oblidar
// la contrasenya.
import React, { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import messages from "./AuthModal.lang";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { loginThunk } from "../store/authSlice";
import StyledButton from "@/style/StyledButton";

interface AuthFormProps {
  /** Acció posterior a un login correcte (tancar el modal, per exemple). */
  onSuccess?: () => void;
  /** Acció en navegar fora del formulari (signup, oblidar contrasenya): tanca
   * el modal si n'hi ha un, perquè no quedi obert sobre la pàgina nova. */
  onNavigateAway?: () => void;
  /** Posa el focus al camp de correu en muntar-se. Només té sentit en un modal. */
  autoFocus?: boolean;
}

const AuthForm = ({
  onSuccess,
  onNavigateAway,
  autoFocus = false,
}: AuthFormProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const appLang = useAppSelector((state) => state.ui.lang.app);
  const { isLoading, errorCode } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    const result = await dispatch(loginThunk({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      onSuccess?.();
    }
  };

  const goTo = (path: string): void => {
    onNavigateAway?.();
    navigate(`/${appLang}/${path}`);
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
        autoComplete="current-password"
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

      <Typography
        variant="body2"
        align="right"
        sx={{ cursor: "pointer", color: "primary.main" }}
        onClick={() => goTo("forgot-password")}
      >
        {intl.formatMessage(messages.forgotPassword)}
      </Typography>

      {/* El botó de la casa: dins del diàleg de login comparteix pantalla amb
          el peu, i un «ENTRA» en majúscules al costat d'un «Tancar» que no ho
          està es llegeix com si fossin de dues aplicacions */}
      <StyledButton
        type="submit"
        variant="contained"
        fullWidth
        disabled={isLoading || !email || !password}
        startIcon={isLoading ? <CircularProgress size={16} /> : null}
      >
        {intl.formatMessage(messages.submitLogin)}
      </StyledButton>

      <Typography
        variant="body2"
        align="center"
        sx={{ cursor: "pointer", color: "primary.main" }}
        onClick={() => goTo("signup")}
      >
        {intl.formatMessage(messages.toggleToRegister)}
      </Typography>
    </Box>
  );
};

export default AuthForm;
