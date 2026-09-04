// Component que centralitza tots els side effects d'inicialització de l'app.
// S'ha d'ubicar dins de <Provider> per poder accedir a dispatch,
// però no necessita BrowserRouter ni ThemeProvider.
import { ReactNode, ReactElement, useEffect } from "react";
import { useAppDispatch } from "../hooks";
import {
  updateDefaultSettingsActionCreator,
  updateLangSettingsActionCreator,
  updateThemeActionCreator,
  applyUserViewSettingsActionCreator,
  updateImageQualityActionCreator,
} from "@features/user-settings/store/uiSlice";
import {
  getStoredAccountUi,
  getStoredUserUi,
} from "../../features/user-settings/storage/settingsStorage";
import { langTranslateApp } from "../../configs/languagesConfigs";
import { LangsApp } from "../../types/ui";
import { refreshSessionThunk } from "@features/backend/auth/store/authSlice";
import { useWarmUpOnReturn } from "@features/backend/api/useWarmUpOnReturn";
import { ACCOUNTS_ENABLED } from "../../configs/accountsConfig";

interface AppBootstrapProps {
  children: ReactNode;
}

const AppBootstrap = ({ children }: AppBootstrapProps): ReactElement => {
  const dispatch = useAppDispatch();

  // Qui torna a la pestanya després d'una estona es troba el servidor adormit:
  // val més començar a despertar-lo ara que quan premi «Desa al núvol»
  useWarmUpOnReturn();

  useEffect(() => {
    // L'última configuració coneguda del compte mana sobre la de l'anònim: si hi
    // és, l'última cosa que va passar en aquest navegador va ser tenir sessió, i
    // esperar el servidor per pintar-la vol dir fins a un minut amb el tema i
    // l'idioma d'una altra persona. La caché s'esborra en tancar sessió i quan el
    // refresc silenciós falla, de manera que la seva presència ja és el senyal.
    // Amb els comptes apagats no es mira la del compte: pintar la configuració
    // d'una sessió que ja no es pot obrir seria deixar el tema i l'idioma d'algú
    // altre en un dispositiu compartit sense cap manera de tancar-los.
    const storedUi =
      (ACCOUNTS_ENABLED ? getStoredAccountUi() : null) ?? getStoredUserUi();

    if (storedUi) {
      dispatch(updateDefaultSettingsActionCreator(storedUi.defaultSettings));
      dispatch(updateThemeActionCreator(storedUi.theme));
      dispatch(updateLangSettingsActionCreator({ app: storedUi.lang.app, search: storedUi.lang.search }));
      // `applyUser…` i no `viewSettings…`: si l'esborrany ja ha restaurat el
      // format amb què es treballava, mana aquell i no la preferència desada
      if (storedUi.viewSettings) {
        dispatch(applyUserViewSettingsActionCreator(storedUi.viewSettings));
      }
      if (storedUi.imageQuality) {
        dispatch(updateImageQualityActionCreator(storedUi.imageQuality));
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
    // Amb els comptes apagats no s'intenta: una cookie encara viva tornaria a
    // obrir la sessió i ompliria el Redux d'un compte que l'app ja no ensenya.
    if (ACCOUNTS_ENABLED) dispatch(refreshSessionThunk());
  }, [dispatch]);

  return <>{children}</>;
};

export default AppBootstrap;
