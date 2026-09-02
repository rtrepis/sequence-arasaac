// Pàgina de destinació dels dos enllaços que porten a establir una contrasenya:
// la verificació inicial (des del correu de benvinguda del signup) i la
// recuperació (des del correu de "he oblidat la contrasenya"). El backend
// distingeix els dos casos pel token; aquesta pàgina és la mateixa per als dos.
//
// Sense locale a la ruta, com /verify-email: l'enllaç el construeix el
// backend i no sap en quin idioma navega qui l'obre.
//
// Abans de demanar res, la pàgina pregunta al servidor **de quin compte és
// l'enllaç** i ho ensenya: el nom, el correu i si la contrasenya que s'hi
// escriurà és la primera o substitueix una d'existent. En AAC el dispositiu es
// comparteix, i qui obre un enllaç d'un correu ha de poder veure que és el seu
// abans d'escriure-hi cap contrasenya.
import React, { ReactElement, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { PasswordLinkInfo } from "@sequence-arasaac/shared-types";
import messages from "./SetPasswordPage.lang";
import StyledButton from "@/style/StyledButton";
import { APP_FIELD_RADIUS } from "@/style/appShape";
import AuthLayout from "@components/AuthLayout/AuthLayout";
import UserAvatar from "@components/UserAvatar/UserAvatar";
import PasswordField, {
  PasswordVisibilityGroup,
} from "@components/PasswordField/PasswordField";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import PasswordStrengthGuide, {
  getPasswordRequirements,
} from "@features/backend/auth/components/PasswordStrengthGuide";
import { getPasswordLinkInfo } from "@features/backend/auth/services/authService";
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

  // De quin compte és l'enllaç. `undefined` mentre s'està comprovant.
  const [linkInfo, setLinkInfo] = useState<PasswordLinkInfo | null | undefined>(
    undefined,
  );
  const [linkErrorCode, setLinkErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLinkInfo(null);
      return;
    }

    let cancelled = false;

    void (async (): Promise<void> => {
      try {
        const info = await getPasswordLinkInfo(token);
        if (!cancelled) setLinkInfo(info);
      } catch (error: unknown) {
        const code =
          (error as { response?: { data?: { errorCode?: string } } })?.response
            ?.data?.errorCode ?? "VERIFICATION_TOKEN_INVALID";
        if (!cancelled) {
          setLinkErrorCode(code);
          setLinkInfo(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const requirements = getPasswordRequirements(password);
  const requirementsMet = requirements.every((r) => r.met);
  const mismatch =
    touched &&
    passwordConfirmation.length > 0 &&
    password !== passwordConfirmation;

  const toMessage = (code: string): string =>
    intl.formatMessage(
      authMessages[code as keyof typeof authMessages] ??
        authMessages.UNKNOWN_ERROR,
    );

  const isInvalidToken =
    errorCode === "VERIFICATION_TOKEN_INVALID" ||
    errorCode === "VERIFICATION_TOKEN_MISSING";

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (
      !token ||
      isLoading ||
      !requirementsMet ||
      password !== passwordConfirmation
    )
      return;

    const result = await dispatch(
      setPasswordThunk({ token, password, passwordConfirmation }),
    );

    if (setPasswordThunk.fulfilled.match(result)) {
      navigate(`/${appLang}/create-sequence`);
    }
  };

  const forgotPasswordLink = (
    <Link
      component="button"
      type="button"
      variant="body2"
      color="inherit"
      onClick={() => navigate(`/${appLang}/forgot-password`)}
    >
      {intl.formatMessage(messages.forgotPasswordLink)}
    </Link>
  );

  // Encara comprovant de qui és l'enllaç: no es demana cap contrasenya fins que
  // se sap a quin compte anirà a parar
  if (linkInfo === undefined) {
    return (
      <AuthLayout title={intl.formatMessage(messages.checkingTitle)}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage(messages.checking)}
          </Typography>
        </Stack>
      </AuthLayout>
    );
  }

  // Enllaç incomplet, caducat o d'un compte que ja no hi és
  if (!token || !linkInfo) {
    return (
      <AuthLayout title={intl.formatMessage(messages.invalidLinkTitle)}>
        <Alert severity="error" variant="outlined">
          {token && linkErrorCode
            ? toMessage(linkErrorCode)
            : intl.formatMessage(messages.missingToken)}
        </Alert>
        <Box>{forgotPasswordLink}</Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={intl.formatMessage(
        linkInfo.hasPassword ? messages.pageTitleReset : messages.pageTitle,
      )}
      subtitle={
        linkInfo.name
          ? intl.formatMessage(messages.greeting, { name: linkInfo.name })
          : undefined
      }
    >
      {/* Confirmació de a quin compte s'entrarà: la mateixa rodona que porta la
          barra de l'app amb sessió iniciada, perquè es llegeixi com el mateix
          senyal quan hi hagi entrat */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          p: 2,
          border: 1,
          borderColor: "divider",
          borderRadius: `${APP_FIELD_RADIUS}px`,
        }}
      >
        <UserAvatar email={linkInfo.email} size={44} />
        <Box sx={{ minWidth: 0 }}>
          {linkInfo.name && (
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {linkInfo.name}
            </Typography>
          )}
          {/* L'adreça no es parteix per la meitat en un telèfon: és el que s'ha
              de poder reconèixer d'una ullada */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: "anywhere" }}
          >
            {linkInfo.email}
          </Typography>
        </Box>
      </Stack>

      <Alert severity="info" variant="outlined">
        {intl.formatMessage(
          linkInfo.hasPassword ? messages.hintReplace : messages.hintFirst,
        )}
      </Alert>

      {errorCode && (
        <Alert severity="error" variant="outlined">
          {toMessage(errorCode)}
          {isInvalidToken && <Box sx={{ mt: 1 }}>{forgotPasswordLink}</Box>}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {/* El grup és qui garanteix que només un dels dos camps quedi destapat:
            amb els dos alhora, repetir la contrasenya deixa de comprovar res */}
        <PasswordVisibilityGroup>
          <PasswordField
            name="new-password"
            label={intl.formatMessage(messages.password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoFocus
            autoComplete="new-password"
          />

          <PasswordStrengthGuide password={password} />

          <PasswordField
            name="confirm-password"
            label={intl.formatMessage(messages.passwordConfirmation)}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            onBlur={() => setTouched(true)}
            required
            fullWidth
            autoComplete="new-password"
            error={mismatch}
            helperText={
              mismatch ? intl.formatMessage(messages.mismatch) : undefined
            }
          />
        </PasswordVisibilityGroup>

        <StyledButton
          type="submit"
          variant="contained"
          fullWidth
          disabled={
            !requirementsMet ||
            !passwordConfirmation ||
            password !== passwordConfirmation
          }
          aria-busy={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {intl.formatMessage(messages.submit)}
        </StyledButton>
      </Box>

      {/* Qui rep un enllaç que no ha demanat ha de saber que no ha de fer res:
          és el consell que evita que el faci servir "per si de cas" */}
      <Typography variant="caption" color="text.secondary">
        {intl.formatMessage(messages.notYou)}
      </Typography>
    </AuthLayout>
  );
};

export default SetPasswordPage;
