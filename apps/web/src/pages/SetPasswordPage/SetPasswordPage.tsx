// Pàgina de destinació dels dos enllaços que porten a establir una contrasenya:
// la verificació inicial (des del correu de benvinguda del signup) i la
// recuperació (des del correu de "he oblidat la contrasenya"). El backend
// distingeix els dos casos pel token; aquesta pàgina és la mateixa per als dos.
//
// Sense locale a la ruta, com /verify-email: l'enllaç el construeix el
// backend i no sap en quin idioma navega qui l'obre.
import React, { ReactElement, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useSearchParams } from "react-router-dom";
import messages from "./SetPasswordPage.lang";
import StyledButton from "@/style/StyledButton";
import { APP_CORNER_RADIUS } from "@/style/appShape";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import PasswordStrengthGuide, {
  getPasswordRequirements,
} from "@features/backend/auth/components/PasswordStrengthGuide";
import { setPasswordThunk } from "@features/backend/auth/store/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const SetPasswordPage = (): ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const appLang = useAppSelector((state) => state.ui.lang.app);
  const { isLoading, errorCode } = useAppSelector((state) => state.auth);

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [touched, setTouched] = useState(false);

  const requirements = getPasswordRequirements(password);
  const requirementsMet = requirements.every((r) => r.met);
  const mismatch =
    touched &&
    passwordConfirmation.length > 0 &&
    password !== passwordConfirmation;

  const errorMessage = errorCode
    ? intl.formatMessage(
        authMessages[errorCode as keyof typeof authMessages] ??
          authMessages.UNKNOWN_ERROR,
      )
    : null;

  const isInvalidToken =
    errorCode === "VERIFICATION_TOKEN_INVALID" ||
    errorCode === "VERIFICATION_TOKEN_MISSING";

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!token || !requirementsMet || password !== passwordConfirmation) return;

    const result = await dispatch(
      setPasswordThunk({ token, password, passwordConfirmation }),
    );

    if (setPasswordThunk.fulfilled.match(result)) {
      navigate(`/${appLang}/create-sequence`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: "background.default",
      }}
    >
      {/* La targeta és una superfície que sura sobre l'escriptori: porta la
          cantonada de la casa, com els diàlegs i els controls */}
      <Paper
        sx={{
          p: 4,
          maxWidth: 480,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: `${APP_CORNER_RADIUS}px`,
        }}
      >
        <Typography variant="h5" component="h1" align="center">
          {intl.formatMessage(messages.pageTitle)}
        </Typography>

        {!token ? (
          <Alert severity="error" variant="outlined">
            {intl.formatMessage(messages.missingToken)}
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Alert severity="info" variant="outlined">
              {intl.formatMessage(messages.hint)}
            </Alert>

            {errorMessage && (
              <Alert severity="error" variant="outlined">
                {errorMessage}
                {isInvalidToken && (
                  <Box sx={{ mt: 1 }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      color="inherit"
                      onClick={() => navigate(`/${appLang}/forgot-password`)}
                    >
                      {intl.formatMessage(messages.forgotPasswordLink)}
                    </Link>
                  </Box>
                )}
              </Alert>
            )}

            <TextField
              label={intl.formatMessage(messages.password)}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoFocus
              autoComplete="new-password"
              disabled={isLoading}
            />

            <PasswordStrengthGuide password={password} />

            <TextField
              label={intl.formatMessage(messages.passwordConfirmation)}
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              onBlur={() => setTouched(true)}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isLoading}
              error={mismatch}
              helperText={
                mismatch ? intl.formatMessage(messages.mismatch) : undefined
              }
            />

            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={
                isLoading ||
                !requirementsMet ||
                !passwordConfirmation ||
                password !== passwordConfirmation
              }
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {intl.formatMessage(messages.submit)}
            </StyledButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SetPasswordPage;
