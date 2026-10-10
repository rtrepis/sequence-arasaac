import { Navigate, Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import { ReactElement, lazy, Suspense } from "react";
import LanguageLayout from "./pages/LanguagesLayout/LanguagesLayaut";
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

import { usePageTracking } from "@shared/hooks/usePageTracking";
import { ACCOUNTS_ENABLED } from "./configs/accountsConfig";
import { useAppSelector } from "./app/hooks";

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
  // Aquí hi havia un efecte que, amb sessió (o amb la caché del compte),
  // reescrivia la URL a l'idioma desat: `/ca/…` saltava a `/en/…`. Sense compte
  // no ho feia, i eren dues regles per a la mateixa cosa (B23). Ara mana sempre
  // la URL, i l'idioma desat només decideix on aterra qui entra per l'arrel o
  // per una adreça antiga sense idioma (`useCurrentLocale`).

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
