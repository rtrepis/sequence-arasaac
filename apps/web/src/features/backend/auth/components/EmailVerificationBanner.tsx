// Avís que el correu del compte encara no està verificat.
//
// Es mostra només a qui té sessió iniciada i el correu pendent. No bloqueja res
// de la interfície: l'usuari pot seguir treballant, només no pot desar al núvol.
// Per això és un Alert i no un diàleg — informa, no interromp.
import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./EmailVerification.lang";
import authMessages from "./AuthModal.lang";
import { useAppSelector } from "../../../../app/hooks";
import { resendVerification } from "../services/authService";

const EmailVerificationBanner = (): React.ReactElement | null => {
  const intl = useIntl();
  const { accessToken, userEmail, emailVerified } = useAppSelector(
    (state) => state.auth,
  );

  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // emailVerified === null vol dir que encara no se sap: no s'alarma ningú abans d'hora
  if (!accessToken || emailVerified !== false) {
    return null;
  }

  const handleResend = async (): Promise<void> => {
    if (!userEmail) return;
    setIsSending(true);
    setFeedback(null);
    setErrorCode(null);

    try {
      await resendVerification(userEmail);
      setFeedback(intl.formatMessage(messages.resendSuccess));
    } catch (error: unknown) {
      const code =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "VERIFICATION_EMAIL_FAILED";
      setErrorCode(code);
    } finally {
      setIsSending(false);
    }
  };

  const errorMessage = errorCode
    ? intl.formatMessage(
        authMessages[errorCode as keyof typeof authMessages] ??
          authMessages.VERIFICATION_EMAIL_FAILED,
      )
    : null;

  return (
    <Box sx={{ px: 2, pt: 1 }}>
      <Alert
        severity="warning"
        variant="outlined"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleResend}
            disabled={isSending}
            startIcon={isSending ? <CircularProgress size={14} /> : null}
          >
            {intl.formatMessage(messages.resend)}
          </Button>
        }
      >
        {intl.formatMessage(messages.bannerPending, {
          email: userEmail ?? "",
        })}
        {feedback && <Box sx={{ mt: 0.5 }}>{feedback}</Box>}
        {errorMessage && <Box sx={{ mt: 0.5 }}>{errorMessage}</Box>}
      </Alert>
    </Box>
  );
};

export default EmailVerificationBanner;
