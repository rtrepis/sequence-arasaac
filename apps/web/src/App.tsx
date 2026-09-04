import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";
import { ReactElement, lazy, Suspense, useEffect, useState } from "react";
import LanguageLayout from "./pages/LanguagesLayout/LanguagesLayaut";
import { getStoredAccountUi } from "./features/user-settings/storage/settingsStorage";
import WelcomeLayout from "./pages/WelcomePage/WelcomeLayout";
import AuthStandaloneLayout from "./pages/AuthStandaloneLayout/AuthStandaloneLayout";
import { Box, CircularProgress } from "@mui/material";

// Pàgines carregades de forma diferida (code splitting per ruta)
const EditSequencesPage = lazy(
  () => import("./pages/EditSequencesPage/EditSequencesPage"),
);
const ViewSequencePage = lazy(
  () => import("./pages/ViewSequencePage/ViewSequencePage"),
);
const NewsLayout = lazy(() => import("./pages/NewsLayout/NewsLayout"));
const ChangelogPage = lazy(() => import("./pages/ChangelogPage/ChangelogPage"));
const NewsDetailPage = lazy(
  () => import("./pages/NewsDetailPage/NewsDetailPage"),
);
const SignupPage = lazy(() => import("./pages/SignupPage/SignupPage"));
const SetPasswordPage = lazy(
  () => import("./pages/SetPasswordPage/SetPasswordPage"),
);
const ForgotPasswordPage = lazy(
  () => import("./pages/ForgotPasswordPage/ForgotPasswordPage"),
);
const AdminPage = lazy(() => import("./pages/AdminPage/AdminPage"));

import messages_en from "./languages/en.json";
import messages_es from "./languages/es.json";
import messages_ca from "./languages/ca.json";
import messages_fr from "./languages/fr.json";
import messages_it from "./languages/it.json";

export const messageLocale = {
  ca: messages_ca,
  es: messages_es,
  en: messages_en,
  fr: messages_fr,
  it: messages_it,
};
import { usePageTracking } from "@shared/hooks/usePageTracking";
import { ACCOUNTS_ENABLED } from "./configs/accountsConfig";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
import { useAppSelector } from "./app/hooks";
import { langTranslateApp } from "./configs/languagesConfigs";
import { LangsApp } from "./types/ui";

// Fallback mentre es carrega un chunk de ruta
const PageLoadingFallback = (): ReactElement => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="50vh"
  >
    <CircularProgress />
  </Box>
);

// Redirigeix /news/:slug → /${appLang}/news/:slug (compatibilitat URLs antigues)
const RedirectNews = ({ appLang }: { appLang: string }): ReactElement => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/${appLang}/news/${slug ?? ""}`} replace />;
};

const App = (): ReactElement => {
  usePageTracking();
  const {
    lang: { app: appLang },
  } = useAppSelector((state) => state.ui);
  const isAuthenticated = useAppSelector(selectIsLoggedIn);
  const location = useLocation();
  const navigate = useNavigate();

  // Quan l'idioma del compte no és el de la URL, navega a la mateixa pàgina amb
  // el locale correcte (ex: /ca/create-sequence → /fr/create-sequence).
  //
  // No espera l'autenticació si el navegador ja porta la configuració del compte
  // desada: aquell efecte és el que feia que la URL saltés a mitja feina quan
  // responia Render, fins a un minut després d'arrencar. Amb la caché, l'idioma
  // bo ja hi és al primer render i la correcció passa abans que hi hagi res per
  // llegir. Sense caché no es toca res: a l'usuari sense compte, un enllaç
  // /ca/… continua obrint-se en català.
  // Es llegeix un sol cop, en muntar: el que interessa és si aquest navegador ja
  // coneixia un compte **en arrencar**. Si s'hi entra després, la condició la fa
  // `isAuthenticated`.
  // Amb els comptes apagats la caché del compte no mana res: el que hi ha
  // desat és d'una sessió que ja no es pot tenir.
  const [hasAccountSettings] = useState(
    () => ACCOUNTS_ENABLED && getStoredAccountUi() !== null,
  );

  useEffect(() => {
    if (!isAuthenticated && !hasAccountSettings) return;

    const segments = location.pathname.split("/").filter(Boolean);
    const urlLocale = segments[0] as LangsApp;

    if (!langTranslateApp.includes(urlLocale) || urlLocale === appLang) return;

    const rest = segments.slice(1).join("/");
    navigate(`/${appLang}/${rest}`, { replace: true });
  }, [appLang, isAuthenticated, hasAccountSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route
          path="/"
          index
          element={<WelcomeLayout localeBrowser={appLang} />}
        />

        {/* Redirects de URLs antigues sense locale */}
        <Route
          path="changelog"
          element={<Navigate to={`/${appLang}/news`} replace />}
        />
        <Route path="news/:slug" element={<RedirectNews appLang={appLang} />} />
        <Route
          path="create-sequence"
          element={<Navigate to={`../${appLang}/create-sequence`} replace />}
        />
        <Route
          path="view-sequence"
          element={<Navigate to={`../${appLang}/create-sequence`} replace />}
        />

        {/* App (editor/visualitzador) amb BarNavigation */}
        <Route
          path=":locale"
          element={<LanguageLayout localeBrowser={appLang} />}
        >
          <Route path="create-sequence" element={<EditSequencesPage />} />
          <Route path="view-sequence" element={<ViewSequencePage />} />
        </Route>

        {/* Secció de notícies — més específic que :locale, cap col·lisió */}
        <Route
          path=":locale/news"
          element={<NewsLayout localeBrowser={appLang} />}
        >
          <Route index element={<ChangelogPage />} />
          <Route path=":slug" element={<NewsDetailPage />} />
        </Route>

        {/* Pàgines d'autenticació fora de LanguageLayout (no porten BarNavigation):
            signup i forgot-password es naveguen des de dins l'app i porten locale;
            set-password és destí d'un enllaç construït pel backend i no en porta
            —el layout hi cau al localeBrowser. Comparteixen AuthStandaloneLayout
            perquè totes necessiten el seu propi <IntlProvider>, que aquí no els
            arriba de LanguageLayout. */}
        {ACCOUNTS_ENABLED && (
          <Route element={<AuthStandaloneLayout localeBrowser={appLang} />}>
            <Route path=":locale/signup" element={<SignupPage />} />
            <Route
              path=":locale/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route path="set-password" element={<SetPasswordPage />} />
          </Route>
        )}

        {/* Panell d'administració — eina interna, fora de LanguageLayout.
            Va amb la resta de funcions de compte: hi cal sessió d'administrador,
            i sense comptes no n'hi pot haver cap. */}
        {ACCOUNTS_ENABLED && <Route path="admin" element={<AdminPage />} />}

        <Route path="*" element={<Navigate to={"/"} replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
