// Pàgina de recuperació de contrasenya: demana el correu i envia un enllaç cap
// a SetPasswordPage. La resposta és sempre la mateixa, existeixi o no el
// compte — el backend (POST /auth/forgot-password) no ho distingeix mai, i és
// el mateix motiu pel qual el signup no diu si un correu ja té compte: una
// resposta diferenciada deixaria enumerar quines adreces hi estan registrades.
//
// El que sí que es pot confirmar és **a quina adreça s'ha escrit**: la pantalla
// de resultat la repeteix sencera i deixa tornar enrere a corregir-la, que és
// el dubte real de qui no veu arribar el correu.
import React, { useState } from "react";
import { Alert, Box, CircularProgress, Link, TextField } from "@mui/material";
import {
  AiOutlineClockCircle,
  AiOutlineMail,
  AiOutlineTool,
} from "react-icons/ai";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import messages from "./ForgotPasswordPage.lang";
import StyledButton from "@/style/StyledButton";
import AuthLayout from "@components/AuthLayout/AuthLayout";
import AuthHighlights from "@components/AuthLayout/AuthHighlights";
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
    if (isLoading) return;

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

  const highlights = (
    <AuthHighlights
      title={intl.formatMessage(messages.asideTitle)}
      items={[
        {
          id: "inbox",
          icon: <AiOutlineMail />,
          title: intl.formatMessage(messages.hintInboxTitle),
          description: intl.formatMessage(messages.hintInboxText),
        },
        {
          id: "expires",
          icon: <AiOutlineClockCircle />,
          title: intl.formatMessage(messages.hintExpiresTitle),
          description: intl.formatMessage(messages.hintExpiresText),
        },
        {
          id: "meanwhile",
          icon: <AiOutlineTool />,
          title: intl.formatMessage(messages.hintMeanwhileTitle),
          description: intl.formatMessage(messages.hintMeanwhileText),
        },
      ]}
    />
  );

  if (submittedEmail) {
    return (
      <AuthLayout
        title={intl.formatMessage(messages.successTitle)}
        aside={highlights}
      >
        <Alert severity="success" variant="outlined">
          {intl.formatMessage(messages.success, { email: submittedEmail })}
        </Alert>

        <StyledButton
          variant="contained"
          onClick={() => navigate(`/${locale}/create-sequence`)}
        >
          {intl.formatMessage(messages.goToApp)}
        </StyledButton>

        {/* La sortida de qui s'ha equivocat escrivint l'adreça: tornar al
            formulari amb el que hi havia, no començar de zero */}
        <StyledButton color="inherit" onClick={() => setSubmittedEmail(null)}>
          {intl.formatMessage(messages.changeEmail)}
        </StyledButton>

        <Link
          component="button"
          type="button"
          variant="body2"
          color="inherit"
          onClick={() => navigate(`/${locale}/signup`)}
          sx={{ alignSelf: "center" }}
        >
          {intl.formatMessage(messages.signupLink)}
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={intl.formatMessage(messages.pageTitle)}
      subtitle={intl.formatMessage(messages.hint)}
      aside={highlights}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label={intl.formatMessage(messages.email)}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoFocus
          autoComplete="email"
          helperText={intl.formatMessage(messages.emailHelp)}
        />

        <StyledButton
          type="submit"
          variant="contained"
          fullWidth
          disabled={!email}
          aria-busy={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {intl.formatMessage(messages.submit)}
        </StyledButton>

        <Link
          component="button"
          type="button"
          variant="body2"
          color="inherit"
          onClick={() => navigate(`/${locale}/signup`)}
          sx={{ alignSelf: "center" }}
        >
          {intl.formatMessage(messages.signupLink)}
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
