// Pàgina de creació de compte: nom, ús de l'aplicació i correu — sense
// contrasenya. La contrasenya s'estableix després, a partir de l'enllaç del
// correu de benvinguda (vegeu SetPasswordPage).
//
// El formulari conviu amb l'avís de places limitades: les altes van comptades
// (un sostre total i un de diari, vegeu `modules/config` a l'API) i qui arriba
// aquí ho ha de saber **abans** d'omplir res, no en prémer el botó.
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Link,
  Stack,
  TextField,
} from "@mui/material";
import {
  AiOutlineCheckCircle,
  AiOutlineCloudUpload,
  AiOutlinePicture,
  AiOutlineSetting,
} from "react-icons/ai";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import { UserUseCase } from "@sequence-arasaac/shared-types";
import messages from "./SignupPage.lang";
import SignupRegistrationNotice, {
  getClosedReason,
} from "./SignupRegistrationNotice";
import StyledButton from "@/style/StyledButton";
import AuthLayout from "@components/AuthLayout/AuthLayout";
import AuthHighlights from "@components/AuthLayout/AuthHighlights";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import useRegistrationStatus from "@features/backend/auth/hooks/useRegistrationStatus";
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

  const { status, refresh } = useRegistrationStatus();
  const closedReason = getClosedReason(status);

  // Estable: useCountdown no reinicia el compte enrere quan canvia la funció,
  // i amb una de nova a cada render el rellotge tornaria a començar cada segon
  const handleCountdownOver = useCallback(() => refresh(), [refresh]);

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
    // Guarda al handler i no `disabled` al botó: un botó desactivat surt de
    // l'ordre de tabulació i qui navega amb teclat el perd sense cap avís
    if (!useCase || isLoading || closedReason) return;

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
      // Una alta rebutjada per un sostre vol dir que la xifra que hi ha a
      // pantalla ja no és bona: algú altre s'hi ha posat mentre s'omplia
      refresh();
    } finally {
      setIsLoading(false);
    }
  };

  // El reenviament no requereix sessió, i és imprescindible que no en requereixi:
  // un compte acabat de crear encara no té contrasenya i no pot iniciar-ne cap.
  // El servidor respon sempre igual (204) per no revelar quins correus tenen
  // compte, així que aquí es pot confirmar que s'ha demanat, mai que hagi arribat.
  const handleResend = async (): Promise<void> => {
    if (!submittedEmail || isResending) return;

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

  const goToApp = (): void => {
    navigate(`/${locale}/create-sequence`);
  };

  const title = intl.formatMessage(
    submittedEmail
      ? emailSent === false
        ? messages.failedTitle
        : messages.successTitle
      : messages.pageTitle,
  );

  const highlights = (
    <AuthHighlights
      title={intl.formatMessage(messages.asideTitle)}
      items={[
        {
          id: "cloud",
          icon: <AiOutlineCloudUpload />,
          title: intl.formatMessage(messages.benefitCloudTitle),
          description: intl.formatMessage(messages.benefitCloudText),
        },
        {
          id: "vocabulary",
          icon: <AiOutlinePicture />,
          title: intl.formatMessage(messages.benefitVocabularyTitle),
          description: intl.formatMessage(messages.benefitVocabularyText),
        },
        {
          id: "settings",
          icon: <AiOutlineSetting />,
          title: intl.formatMessage(messages.benefitSettingsTitle),
          description: intl.formatMessage(messages.benefitSettingsText),
        },
        {
          id: "no-account",
          icon: <AiOutlineCheckCircle />,
          title: intl.formatMessage(messages.benefitNoAccountTitle),
          description: intl.formatMessage(messages.benefitNoAccountText),
        },
      ]}
    />
  );

  // Pantalla de resultat: el compte ja existeix i el que queda per dir és si el
  // correu ha sortit o no
  if (submittedEmail) {
    return (
      <AuthLayout title={title} aside={highlights}>
        {emailSent === false ? (
          <>
            <Alert severity="warning" variant="outlined">
              {intl.formatMessage(messages.failed, { email: submittedEmail })}
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
              aria-disabled={isResending}
              aria-busy={isResending}
              startIcon={isResending ? <CircularProgress size={16} /> : null}
            >
              {intl.formatMessage(messages.resend)}
            </StyledButton>
            <StyledButton color="inherit" onClick={goToApp}>
              {intl.formatMessage(messages.goToApp)}
            </StyledButton>
          </>
        ) : (
          <>
            <Alert severity="success" variant="outlined">
              {intl.formatMessage(messages.success, { email: submittedEmail })}
            </Alert>
            <StyledButton variant="contained" onClick={goToApp}>
              {intl.formatMessage(messages.goToApp)}
            </StyledButton>
          </>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={title}
      subtitle={intl.formatMessage(messages.pageSubtitle)}
      aside={highlights}
    >
      <SignupRegistrationNotice
        status={status}
        onCountdownOver={handleCountdownOver}
      />

      {errorMessage && (
        <Alert severity="error" variant="outlined">
          {errorMessage}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {/* `disabled` de debò, i no `aria-disabled`: aquí el camp no està
            ocupat fent res —no hi cap cap alta més fins que el comptador es
            renovi—, i el que el desactiva és una condició del servidor, no
            una espera. L'avís de sobre en diu el motiu i quan es podrà tornar. */}
        <TextField
          label={intl.formatMessage(messages.name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          autoFocus
          autoComplete="name"
          disabled={closedReason !== null}
        />

        <TextField
          select
          label={intl.formatMessage(messages.useCase)}
          value={useCase}
          onChange={(e) => setUseCase(e.target.value as UserUseCase)}
          required
          fullWidth
          disabled={closedReason !== null}
          helperText={intl.formatMessage(messages.useCaseHelp)}
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
            disabled={closedReason !== null}
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
          disabled={closedReason !== null}
          helperText={intl.formatMessage(messages.emailHelp)}
        />

        <StyledButton
          type="submit"
          variant="contained"
          fullWidth
          disabled={closedReason !== null || !name || !useCase || !email}
          aria-busy={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {intl.formatMessage(messages.submit)}
        </StyledButton>

        <Stack spacing={1} alignItems="center">
          {/* Enllaç de debò i no un `Typography` amb `cursor: pointer`: així s'hi
              arriba amb el tabulador, i amb la tinta del tema es llegeix (el verd
              de la casa com a color de text es queda a 2,1:1) */}
          <Link
            component="button"
            type="button"
            variant="body2"
            color="inherit"
            onClick={goToApp}
          >
            {intl.formatMessage(messages.loginLink)}
          </Link>
          <Link
            component="button"
            type="button"
            variant="body2"
            color="inherit"
            onClick={goToApp}
          >
            {intl.formatMessage(messages.continueWithoutAccount)}
          </Link>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default SignupPage;
