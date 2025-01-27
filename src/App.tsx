import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ViewSequencePage from "./pages/ViewSequencePage/ViewSequencePage";
import EditSequencesPage from "./pages/EditSequencesPage/EditSequencesPage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { updateDefaultSettingsActionCreator } from "./app/slice/uiSlice";
import React from "react";
import LanguageLayout from "./pages/LanguagesLayout/LanguagesLayaut";
import WelcomeLayout from "./pages/WelcomePage/WelcomeLayout";

import messages_en from "./languages/en.json";
import messages_es from "./languages/es.json";
import messages_ca from "./languages/ca.json";

export const messageLocale = {
  ca: messages_ca,
  es: messages_es,
  en: messages_en,
};
import { usePageTracking } from "./hooks/usePageTracking";

const App = ({ locale }: { locale: string }): React.ReactElement => {
  usePageTracking();
  const dispatch = useDispatch();

  useEffect(() => {
    const isPictDefaultSettings =
      sessionStorage.getItem("pictDefaultSettings") ??
      localStorage.getItem("pictDefaultSettings");

    if (isPictDefaultSettings != null) {
      const userDefaultSettings = JSON.parse(isPictDefaultSettings);
      dispatch(updateDefaultSettingsActionCreator(userDefaultSettings));
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/"
        index
        element={<WelcomeLayout localeBrowser={locale} />}
      />
      <Route
        path="create-sequence"
        element={<Navigate to={`../${locale}/create-sequence`} replace />}
      />
      <Route
        path="view-sequence"
        element={<Navigate to={`../${locale}/create-sequence`} replace />}
      />

      <Route path=":locale" element={<LanguageLayout localeBrowser={locale} />}>
        <Route path="create-sequence" element={<EditSequencesPage />} />
        <Route path="view-sequence" element={<ViewSequencePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/ca" replace />} />
    </Routes>
  );
};

export default App;
