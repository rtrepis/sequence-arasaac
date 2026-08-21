import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AiOutlineCheck,
  AiOutlineGlobal,
  AiOutlineLogin,
  AiOutlineMenu,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updateLangSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import AuthModal from "@features/backend/auth/components/AuthModal";
import { langTranslateApp } from "../../configs/languagesConfigs";
import { LANGUAGE_NAMES } from "@shared/constants/languageNames";
import { LangsApp } from "../../types/ui";
import messages from "./HeaderControls.lang";

const sortedLangs = [...langTranslateApp].sort();

/**
 * Botons d'accés (login/registre) i selector d'idioma a la dreta de la
 * NavBar. Per sota de `sm` els tres es pleguen en un únic menú clàssic
 * (icona d'hamburguesa) a la mateixa posició.
 */
const HeaderControls = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale = "ca" } = useParams<{ locale: string }>();

  // El redux "app lang" no sempre coincideix amb el locale de la URL (per
  // exemple en carregar l'app anònimament, abans de triar idioma). El
  // selector mostra i marca el locale de la URL, que és el que realment
  // s'està veient a la pantalla.
  const searchLang = useAppSelector((state) => state.ui.lang.search);
  const isLoggedIn = useAppSelector((state) => state.auth.accessToken !== null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);

  const handleLangChange = (value: string): void => {
    setLangAnchor(null);
    setMobileAnchor(null);
    if (value === locale) return;
    dispatch(
      updateLangSettingsActionCreator({
        app: value as LangsApp,
        search: searchLang,
      }),
    );
    navigate(location.pathname.replace(`/${locale}/`, `/${value}/`));
  };

  const handleLogin = (): void => {
    setMobileAnchor(null);
    setAuthModalOpen(true);
  };

  const handleRegister = (): void => {
    setMobileAnchor(null);
    navigate(`/${locale}/signup`);
  };

  const langMenuItems = sortedLangs.map((lang) => (
    <MenuItem
      key={lang}
      selected={lang === locale}
      onClick={() => handleLangChange(lang)}
    >
      <ListItemIcon>{lang === locale ? <AiOutlineCheck /> : null}</ListItemIcon>
      <ListItemText>{LANGUAGE_NAMES[lang]}</ListItemText>
    </MenuItem>
  ));

  return (
    <>
      {/* Grup complet visible a partir de sm */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: "none", sm: "flex" } }}
      >
        <Tooltip title={intl.formatMessage(messages.languageSelector)}>
          <Button
            color="inherit"
            size="small"
            startIcon={<AiOutlineGlobal />}
            onClick={(event) => setLangAnchor(event.currentTarget)}
            aria-label={intl.formatMessage(messages.languageSelector)}
            aria-haspopup="true"
          >
            {locale.toUpperCase()}
          </Button>
        </Tooltip>

        {!isLoggedIn && (
          <>
            <Button color="inherit" size="small" onClick={handleLogin}>
              {intl.formatMessage(messages.loginButton)}
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={handleRegister}
            >
              {intl.formatMessage(messages.registerButton)}
            </Button>
          </>
        )}
      </Stack>

      {/* Menú clàssic per sota de sm: mateixos ítems plegats en un sol botó */}
      <Box sx={{ display: { xs: "flex", sm: "none" } }}>
        <IconButton
          color="inherit"
          onClick={(event) => setMobileAnchor(event.currentTarget)}
          aria-label={intl.formatMessage(messages.openMenu)}
          aria-haspopup="true"
        >
          <AiOutlineMenu />
        </IconButton>
      </Box>

      {/* Desplegable del selector d'idioma (escriptori) */}
      <Menu
        anchorEl={langAnchor}
        open={Boolean(langAnchor)}
        onClose={() => setLangAnchor(null)}
      >
        {langMenuItems}
      </Menu>

      {/* Menú clàssic mòbil: login, registre i idioma junts */}
      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={() => setMobileAnchor(null)}
      >
        {!isLoggedIn && [
          <MenuItem key="login" onClick={handleLogin}>
            <ListItemIcon>
              <AiOutlineLogin />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.loginButton)}
            </ListItemText>
          </MenuItem>,
          <MenuItem key="register" onClick={handleRegister}>
            <ListItemIcon>
              <AiOutlineUserAdd />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.registerButton)}
            </ListItemText>
          </MenuItem>,
          <Divider key="divider" />,
        ]}
        {langMenuItems}
      </Menu>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default HeaderControls;
