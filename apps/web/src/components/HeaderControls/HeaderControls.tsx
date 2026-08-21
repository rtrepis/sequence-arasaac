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
import { useNavigate } from "react-router-dom";
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
 * Botons d'accés (login/registre) i selector d'idioma de la pantalla
 * d'inici, amb tres nivells segons l'amplada:
 * - Escriptori (`md`+): idioma, login i registre, tots en línia.
 * - Tauleta (`sm`-`md`): registre en línia + menú clàssic amb login i idioma.
 * - Mòbil (<`sm`): tot plegat en un únic menú clàssic.
 */
const HeaderControls = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { app: appLang, search: searchLang } = useAppSelector(
    (state) => state.ui.lang,
  );
  const isLoggedIn = useAppSelector((state) => state.auth.accessToken !== null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [tabletAnchor, setTabletAnchor] = useState<null | HTMLElement>(null);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);

  const handleLangChange = (value: string): void => {
    setLangAnchor(null);
    setTabletAnchor(null);
    setMobileAnchor(null);
    if (value === appLang) return;
    // La pantalla d'inici no porta locale a la URL: n'hi ha prou amb l'estat
    // redux, que ja governa quin catàleg de missatges fa servir el layout.
    dispatch(
      updateLangSettingsActionCreator({
        app: value as LangsApp,
        search: searchLang,
      }),
    );
  };

  const handleLogin = (): void => {
    setTabletAnchor(null);
    setMobileAnchor(null);
    setAuthModalOpen(true);
  };

  const handleRegister = (): void => {
    setMobileAnchor(null);
    navigate(`/${appLang}/signup`);
  };

  const langMenuItems = sortedLangs.map((lang) => (
    <MenuItem
      key={lang}
      selected={lang === appLang}
      onClick={() => handleLangChange(lang)}
    >
      <ListItemIcon>
        {lang === appLang ? <AiOutlineCheck /> : null}
      </ListItemIcon>
      <ListItemText>{LANGUAGE_NAMES[lang]}</ListItemText>
    </MenuItem>
  ));

  const loginMenuItem = (
    <MenuItem key="login" onClick={handleLogin}>
      <ListItemIcon>
        <AiOutlineLogin />
      </ListItemIcon>
      <ListItemText>{intl.formatMessage(messages.loginButton)}</ListItemText>
    </MenuItem>
  );

  const registerMenuItem = (
    <MenuItem key="register" onClick={handleRegister}>
      <ListItemIcon>
        <AiOutlineUserAdd />
      </ListItemIcon>
      <ListItemText>{intl.formatMessage(messages.registerButton)}</ListItemText>
    </MenuItem>
  );

  const registerButton = !isLoggedIn && (
    <Button
      color="primary"
      variant="outlined"
      size="small"
      onClick={handleRegister}
    >
      {intl.formatMessage(messages.registerButton)}
    </Button>
  );

  return (
    <>
      {/* Escriptori (md+): idioma, login i registre en línia */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        <Tooltip title={intl.formatMessage(messages.languageSelector)}>
          <Button
            color="primary"
            size="small"
            startIcon={<AiOutlineGlobal />}
            onClick={(event) => setLangAnchor(event.currentTarget)}
            aria-label={intl.formatMessage(messages.languageSelector)}
            aria-haspopup="true"
          >
            {appLang.toUpperCase()}
          </Button>
        </Tooltip>

        {!isLoggedIn && (
          <Button color="primary" size="small" onClick={handleLogin}>
            {intl.formatMessage(messages.loginButton)}
          </Button>
        )}
        {registerButton}
      </Stack>

      {/* Tauleta (sm-md): registre en línia + menú clàssic amb login i idioma */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: "none", sm: "flex", md: "none" } }}
      >
        {registerButton}
        <IconButton
          color="primary"
          onClick={(event) => setTabletAnchor(event.currentTarget)}
          aria-label={intl.formatMessage(messages.openMenu)}
          aria-haspopup="true"
        >
          <AiOutlineMenu />
        </IconButton>
      </Stack>

      {/* Mòbil (<sm): tot plegat en un únic menú clàssic */}
      <Box sx={{ display: { xs: "flex", sm: "none" } }}>
        <IconButton
          color="primary"
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

      {/* Menú clàssic de tauleta: login i idioma (el registre ja va en línia) */}
      <Menu
        anchorEl={tabletAnchor}
        open={Boolean(tabletAnchor)}
        onClose={() => setTabletAnchor(null)}
      >
        {!isLoggedIn && [loginMenuItem, <Divider key="divider" />]}
        {langMenuItems}
      </Menu>

      {/* Menú clàssic mòbil: login, registre i idioma junts */}
      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={() => setMobileAnchor(null)}
      >
        {!isLoggedIn && [
          loginMenuItem,
          registerMenuItem,
          <Divider key="divider" />,
        ]}
        {langMenuItems}
      </Menu>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default HeaderControls;
