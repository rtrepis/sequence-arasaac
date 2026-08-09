// Pàgina de destinació de l'enllaç de verificació del correu.
//
// L'enllaç del correu apunta aquí i no directament a l'API perquè el resultat
// es vegi dins de l'aplicació, amb el seu idioma i el seu tema, en comptes d'un
// JSON en brut al navegador.
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useSearchParams } from "react-router-dom";
import messages from "@features/backend/auth/components/EmailVerification.lang";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import { verifyEmail } from "@features/backend/auth/services/authService";
import { markEmailVerified } from "@features/backend/auth/store/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

type VerificationState = "verifying" | "verified" | "error";

const VerifyEmailPage = (): ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const appLang = useAppSelector((state) => state.ui.lang.app);

  const [state, setState] = useState<VerificationState>("verifying");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // En mode estricte de React 18 els efectes s'executen dues vegades en dev;
  // sense aquesta guarda es consumiria el token dos cops i el segon intent
  // mostraria un error a l'usuari tot i haver anat bé
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setErrorCode("VERIFICATION_TOKEN_MISSING");
      setState("error");
      return;
    }

    const run = async (): Promise<void> => {
      try {
        await verifyEmail(token);
        dispatch(markEmailVerified());
        setState("verified");
      } catch (error: unknown) {
        const code =
          (error as { response?: { data?: { errorCode?: string } } })?.response
            ?.data?.errorCode ?? "VERIFICATION_TOKEN_INVALID";
        setErrorCode(code);
        setState("error");
      }
    };

    void run();
  }, [searchParams, dispatch]);

  const errorMessage = errorCode
    ? intl.formatMessage(
        authMessages[errorCode as keyof typeof authMessages] ??
          authMessages.VERIFICATION_TOKEN_INVALID,
      )
    : null;

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
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" component="h1">
          {intl.formatMessage(messages.pageTitle)}
        </Typography>

        {state === "verifying" && (
          <>
            <CircularProgress />
            <Typography>{intl.formatMessage(messages.verifying)}</Typography>
          </>
        )}

        {state === "verified" && (
          <Alert severity="success" variant="outlined" sx={{ width: "100%" }}>
            {intl.formatMessage(messages.verified)}
          </Alert>
        )}

        {state === "error" && (
          <Alert severity="error" variant="outlined" sx={{ width: "100%" }}>
            {errorMessage}
          </Alert>
        )}

        {state !== "verifying" && (
          <Button
            variant="contained"
            onClick={() => navigate(`/${appLang}/create-sequence`)}
          >
            {intl.formatMessage(messages.goToApp)}
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmailPage;
