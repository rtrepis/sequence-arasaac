// Pàgina de recuperació de contrasenya: demana el correu i envia un enllaç cap
// a SetPasswordPage. La resposta és sempre la mateixa, existeixi o no el
// compte — el backend (POST /auth/forgot-password) no ho distingeix mai.
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import messages from "./ForgotPasswordPage.lang";
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
      <Paper
        sx={{
          p: 4,
          maxWidth: 480,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
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
            <Button
              variant="contained"
              onClick={() => navigate(`/${locale}/create-sequence`)}
            >
              {intl.formatMessage(messages.goToApp)}
            </Button>
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !email}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {intl.formatMessage(messages.submit)}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
