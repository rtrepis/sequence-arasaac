// Pàgina de creació de compte: nom, ús de l'aplicació i correu — sense
// contrasenya. La contrasenya s'estableix després, a partir de l'enllaç del
// correu de benvinguda (vegeu SetPasswordPage).
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import { UserUseCase } from "@sequence-arasaac/shared-types";
import messages from "./SignupPage.lang";
import StyledButton from "@/style/StyledButton";
import { APP_CORNER_RADIUS } from "@/style/appShape";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import {
  resendVerification,
  signup,
} from "@features/backend/auth/services/authService";
import { warmUpBackend } from "@features/backend/api/warmUpBackend";

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
  // null mentre no s'ha enviat res. Un cop enviat, diu si el correu ha sortit:
  // el compte es crea igualment quan no surt, i qui ho ha demanat ha de poder
  // distingir "mira la safata" de "torna-ho a demanar".
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  // Arribar a aquesta pàgina (des de qualsevol enllaç o per URL directa) ja és
  // senyal prou clar que es vol el backend: mentre s'omple el formulari, el
  // servidor de Render ja s'està despertant.
  useEffect(() => {
    void warmUpBackend();
  }, []);

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
      const result = await signup({
        name,
        useCase,
        useCaseOther: useCase === "other" ? useCaseOther : undefined,
        email,
        locale,
      });
      setSubmittedEmail(email);
      setEmailSent(result.emailSent);
    } catch (error: unknown) {
      const code =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "REGISTER_ERROR";
      setErrorCode(code);
    } finally {
      setIsLoading(false);
    }
  };

  // El reenviament no requereix sessió, i és imprescindible que no en requereixi:
  // un compte acabat de crear encara no té contrasenya i no pot iniciar-ne cap.
  // El servidor respon sempre igual (204) per no revelar quins correus tenen
  // compte, així que aquí es pot confirmar que s'ha demanat, mai que hagi arribat.
  const handleResend = async (): Promise<void> => {
    if (!submittedEmail) return;

    setIsResending(true);
    setErrorCode(null);

    try {
      await resendVerification(submittedEmail);
      setResendDone(true);
    } catch (error: unknown) {
      const code =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "VERIFICATION_EMAIL_FAILED";
      setErrorCode(code);
    } finally {
      setIsResending(false);
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
          {intl.formatMessage(
            submittedEmail
              ? emailSent === false
                ? messages.failedTitle
                : messages.successTitle
              : messages.pageTitle,
          )}
        </Typography>

        {submittedEmail ? (
          <>
            {emailSent === false ? (
              <>
                <Alert severity="warning" variant="outlined">
                  {intl.formatMessage(messages.failed, {
                    email: submittedEmail,
                  })}
                </Alert>

                {resendDone && (
                  <Alert severity="info" variant="outlined">
                    {intl.formatMessage(messages.resendDone)}
                  </Alert>
                )}

                {errorMessage && (
                  <Alert severity="error" variant="outlined">
                    {errorMessage}
                  </Alert>
                )}

                <StyledButton
                  variant="contained"
                  onClick={handleResend}
                  disabled={isResending}
                  startIcon={
                    isResending ? <CircularProgress size={16} /> : null
                  }
                >
                  {intl.formatMessage(messages.resend)}
                </StyledButton>
                <StyledButton
                  color="inherit"
                  onClick={() => navigate(`/${locale}/create-sequence`)}
                >
                  {intl.formatMessage(messages.goToApp)}
                </StyledButton>
              </>
            ) : (
              <>
                <Alert severity="success" variant="outlined">
                  {intl.formatMessage(messages.success, {
                    email: submittedEmail,
                  })}
                </Alert>
                <StyledButton
                  variant="contained"
                  onClick={() => navigate(`/${locale}/create-sequence`)}
                >
                  {intl.formatMessage(messages.goToApp)}
                </StyledButton>
              </>
            )}
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

            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !name || !useCase || !email}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {intl.formatMessage(messages.submit)}
            </StyledButton>

            {/* Enllaç de debò i no un `Typography` amb `cursor: pointer`: així s'hi
                arriba amb el tabulador, i amb la tinta del tema es llegeix (el verd
                de la casa com a color de text es queda a 2,1:1) */}
            <Link
              component="button"
              type="button"
              variant="body2"
              color="inherit"
              onClick={() => navigate(`/${locale}/create-sequence`)}
              sx={{ alignSelf: "center" }}
            >
              {intl.formatMessage(messages.loginLink)}
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SignupPage;
