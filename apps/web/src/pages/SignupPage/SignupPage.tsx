// Pàgina de creació de compte: nom, ús de l'aplicació i correu — sense
// contrasenya. La contrasenya s'estableix després, a partir de l'enllaç del
// correu de benvinguda (vegeu SetPasswordPage).
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import { UserUseCase } from "@sequence-arasaac/shared-types";
import messages from "./SignupPage.lang";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import { signup } from "@features/backend/auth/services/authService";

const USE_CASES: { value: UserUseCase; labelId: keyof typeof messages }[] = [
  { value: "family", labelId: "useCaseFamily" },
  { value: "teacher", labelId: "useCaseTeacher" },
  { value: "professional", labelId: "useCaseProfessional" },
  { value: "other", labelId: "useCaseOther" },
];

const SignupPage = (): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();

  const [name, setName] = useState("");
  const [useCase, setUseCase] = useState<UserUseCase | "">("");
  const [useCaseOther, setUseCaseOther] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const errorMessage = errorCode
    ? intl.formatMessage(
        authMessages[errorCode as keyof typeof authMessages] ??
          authMessages.UNKNOWN_ERROR,
      )
    : null;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!useCase) return;

    setIsLoading(true);
    setErrorCode(null);

    try {
      await signup({
        name,
        useCase,
        useCaseOther: useCase === "other" ? useCaseOther : undefined,
        email,
      });
      setSubmittedEmail(email);
    } catch (error: unknown) {
      const code =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "REGISTER_ERROR";
      setErrorCode(code);
    } finally {
      setIsLoading(false);
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
          {intl.formatMessage(
            submittedEmail ? messages.successTitle : messages.pageTitle,
          )}
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

            {errorMessage && (
              <Alert severity="error" variant="outlined">
                {errorMessage}
              </Alert>
            )}

            <TextField
              label={intl.formatMessage(messages.name)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
              autoComplete="name"
              disabled={isLoading}
            />

            <TextField
              select
              label={intl.formatMessage(messages.useCase)}
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UserUseCase)}
              required
              fullWidth
              disabled={isLoading}
            >
              {USE_CASES.map(({ value, labelId }) => (
                <MenuItem key={value} value={value}>
                  {intl.formatMessage(messages[labelId])}
                </MenuItem>
              ))}
            </TextField>

            {useCase === "other" && (
              <TextField
                label={intl.formatMessage(messages.useCaseOtherLabel)}
                value={useCaseOther}
                onChange={(e) => setUseCaseOther(e.target.value)}
                fullWidth
                disabled={isLoading}
              />
            )}

            <TextField
              label={intl.formatMessage(messages.email)}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !name || !useCase || !email}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {intl.formatMessage(messages.submit)}
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{ cursor: "pointer", color: "primary.main" }}
              onClick={() => navigate(`/${locale}/create-sequence`)}
            >
              {intl.formatMessage(messages.loginLink)}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SignupPage;
