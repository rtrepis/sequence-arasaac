// Component que centralitza tots els side effects d'inicialització de l'app.
// S'ha d'ubicar dins de <Provider> per poder accedir a dispatch,
// però no necessita BrowserRouter ni ThemeProvider.
import { ReactNode, ReactElement, useEffect } from "react";
import { useAppDispatch } from "../hooks";
import {
  updateDefaultSettingsActionCreator,
  updateLangSettingsActionCreator,
} from "../slice/uiSlice";
import {
  getStoredSettings,
  getStoredLangSettings,
} from "../../features/user-settings/storage/settingsStorage";
import {
  langTranslateApp,
  langTranslateSearch,
} from "../../configs/languagesConfigs";
import { LangsApp } from "../../types/ui";

interface AppBootstrapProps {
  children: ReactNode;
}

const AppBootstrap = ({ children }: AppBootstrapProps): ReactElement => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restaura la configuració per defecte del pictograma (sessionStorage → localStorage)
    const storedSettings = getStoredSettings();
    if (storedSettings !== null) {
      dispatch(updateDefaultSettingsActionCreator(storedSettings));
    }

    // Detecta i restaura la configuració de llengua de l'app i de cerca
    const localeBrowser = navigator.language.slice(0, 2);
    const storedLang = getStoredLangSettings();

    const appLang = (
      storedLang?.app
        ? storedLang.app
        : langTranslateApp.includes(localeBrowser as LangsApp)
          ? localeBrowser
          : "en"
    ) as LangsApp;

    const searchLang = storedLang?.search
      ? storedLang.search
      : (langTranslateSearch as readonly string[]).includes(localeBrowser)
        ? localeBrowser
        : "en";

    dispatch(
      updateLangSettingsActionCreator({ app: appLang, search: searchLang, keywords: [] }),
    );
  }, [dispatch]);

  return <>{children}</>;
};

export default AppBootstrap;
