import { Navigate, Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import { ReactElement, lazy, Suspense } from "react";
import LanguageLayout from "./pages/LanguagesLayout/LanguagesLayaut";
import WelcomeLayout from "./pages/WelcomePage/WelcomeLayout";
import { Box, CircularProgress } from "@mui/material";

// Pàgines carregades de forma diferida (code splitting per ruta)
const EditSequencesPage = lazy(
  () => import("./pages/EditSequencesPage/EditSequencesPage")
);
const ViewSequencePage = lazy(
  () => import("./pages/ViewSequencePage/ViewSequencePage")
);
const NewsLayout = lazy(() => import("./pages/NewsLayout/NewsLayout"));
const ChangelogPage = lazy(
  () => import("./pages/ChangelogPage/ChangelogPage")
);
const NewsDetailPage = lazy(
  () => import("./pages/NewsDetailPage/NewsDetailPage")
);

import messages_en from "./languages/en.json";
import messages_es from "./languages/es.json";
import messages_ca from "./languages/ca.json";

export const messageLocale = {
  ca: messages_ca,
  es: messages_es,
  en: messages_en,
};
import { usePageTracking } from "./hooks/usePageTracking";
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
        <Route
          path="news/:slug"
          element={<RedirectNews appLang={appLang} />}
        />
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

        <Route path="*" element={<Navigate to={"/"} replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
