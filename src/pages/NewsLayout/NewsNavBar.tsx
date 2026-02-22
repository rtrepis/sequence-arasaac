import React from "react";
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Stack,
  Toolbar,
} from "@mui/material";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./NewsNavBar.lang";

// Idiomes suportats per a la navegació
const LOCALES = ["ca", "es", "en"] as const;

// Barra de navegació lleugera per a la secció de notícies (/:locale/news)
const NewsNavBar = (): React.ReactElement => {
  const { locale } = useParams<{ locale: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();

  // Canvia l'idioma mantenint la ruta actual (substitueix el primer segment)
  const handleLangChange = (newLocale: string) => {
    const newPath = location.pathname.replace(/^\/(ca|es|en)/, `/${newLocale}`);
    navigate(newPath, { replace: true });
  };

  return (
    <>
      {/* Línia fina superior — idèntica a WelcomePage */}
      <Box bgcolor={"primary.main"} height={"1em"} width={"100vw"} />

      {/* Accés ràpid al contingut principal (accessibilitat) */}
      <a href="#main-content" className="skip-link">
        <FormattedMessage {...messages.skipToContent} />
      </a>

      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Costat esquerre: logo + Inici + Novetats + Crea seqüència */}
          <Stack
            component="nav"
            aria-label={intl.formatMessage(messages.mainNavigation)}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <img src="/favicon.png" alt="SequenciAAC" height={25} width={34} />
            <Button component={Link} to="/" size="small">
              <FormattedMessage {...messages.welcome} />
            </Button>
            <Button component={Link} to={`/${locale}/news`} size="small">
              <FormattedMessage {...messages.news} />
            </Button>
            <Button
              component={Link}
              to={`/${locale}/create-sequence`}
              size="small"
            >
              <FormattedMessage {...messages.start} />
            </Button>
          </Stack>

          {/* Costat dret: selector d'idioma */}
          <ButtonGroup
            size="small"
            aria-label={intl.formatMessage(messages.langSelector)}
          >
            {LOCALES.map((lang) => (
              <Button
                key={lang}
                onClick={() => handleLangChange(lang)}
                variant={locale === lang ? "contained" : "outlined"}
              >
                {lang}
              </Button>
            ))}
          </ButtonGroup>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NewsNavBar;
