// Component que centralitza tots els side effects d'inicialització de l'app.
// S'ha d'ubicar dins de <Provider> per poder accedir a dispatch,
// però no necessita BrowserRouter ni ThemeProvider.
import { ReactNode, ReactElement, useEffect } from "react";
import { useAppDispatch } from "../hooks";
import {
  updateDefaultSettingsActionCreator,
  updateLangSettingsActionCreator,
  updateThemeActionCreator,
  viewSettingsActionCreator,
} from "@features/user-settings/store/uiSlice";
import { getStoredUserUi } from "../../features/user-settings/storage/settingsStorage";
import { langTranslateApp } from "../../configs/languagesConfigs";
import { LangsApp } from "../../types/ui";
import { refreshSessionThunk } from "@features/backend/auth/store/authSlice";

interface AppBootstrapProps {
  children: ReactNode;
}

const AppBootstrap = ({ children }: AppBootstrapProps): ReactElement => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restaura preferències de l'usuari anònim (localStorage)
    // Si hi ha sessió activa, refreshSessionThunk les sobreescriurà amb les del backend
    const storedUi = getStoredUserUi();

    if (storedUi) {
      dispatch(updateDefaultSettingsActionCreator(storedUi.defaultSettings));
      dispatch(updateThemeActionCreator(storedUi.theme));
      dispatch(updateLangSettingsActionCreator({ app: storedUi.lang.app, search: storedUi.lang.search }));
      if (storedUi.viewSettings) {
        dispatch(viewSettingsActionCreator(storedUi.viewSettings));
      }
    } else {
      // Fallback: detecta l'idioma del navegador
      const localeBrowser = navigator.language.slice(0, 2);
      const appLang = langTranslateApp.includes(localeBrowser as LangsApp)
        ? (localeBrowser as LangsApp)
        : "en";
      dispatch(updateLangSettingsActionCreator({ app: appLang, search: appLang }));
    }

    // Intent de restauració de sessió silenciosa via cookie de refresh.
    // Si la cookie és vàlida, sobreescriu Redux amb les preferències del backend.
    dispatch(refreshSessionThunk());
  }, [dispatch]);

  return <>{children}</>;
};

export default AppBootstrap;
