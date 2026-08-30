// Pàgina de recuperació de contrasenya: demana el correu i envia un enllaç cap
// a SetPasswordPage. La resposta és sempre la mateixa, existeixi o no el
// compte — el backend (POST /auth/forgot-password) no ho distingeix mai.
import React, { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import messages from "./ForgotPasswordPage.lang";
import StyledButton from "@/style/StyledButton";
import { APP_CORNER_RADIUS } from "@/style/appShape";
import { forgotPassword } from "@features/backend/auth/services/authService";

const ForgotPasswordPage = (): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
    } finally {
      // S'ensenya sempre l'èxit encara que la petició fallés per xarxa: no hi
      // ha res més que dir-hi, i el missatge ja avisa de mirar spam.
      setIsLoading(false);
      setSubmittedEmail(email);
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

        {submittedEmail ? (
          <>
            <Alert severity="success" variant="outlined">
              {intl.formatMessage(messages.success, { email: submittedEmail })}
            </Alert>
            <StyledButton
              variant="contained"
              onClick={() => navigate(`/${locale}/create-sequence`)}
            >
              {intl.formatMessage(messages.goToApp)}
            </StyledButton>
          </>
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

            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !email}
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

export default ForgotPasswordPage;
