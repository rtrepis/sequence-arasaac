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
import { useAppSelector } from "./app/hooks";
import useAraSaac from "./hooks/useAraSaac";

const App = (): React.ReactElement => {
  usePageTracking();
  const dispatch = useDispatch();
  const {
    lang: { app: appLang, keywords },
  } = useAppSelector((state) => state.ui);
  const { getAllKeyWordsForLanguages } = useAraSaac();

  useEffect(() => {
    const pictDefaultSettings =
      sessionStorage.getItem("pictDefaultSettings") ??
      localStorage.getItem("pictDefaultSettings");

    if (pictDefaultSettings != null) {
      const userDefaultSettings = JSON.parse(pictDefaultSettings);
      dispatch(updateDefaultSettingsActionCreator(userDefaultSettings));
    }

    if (keywords.length === 0) getAllKeyWordsForLanguages();
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/"
        index
        element={<WelcomeLayout localeBrowser={appLang} />}
      />
      <Route
        path="create-sequence"
        element={<Navigate to={`../${appLang}/create-sequence`} replace />}
      />
      <Route
        path="view-sequence"
        element={<Navigate to={`../${appLang}/create-sequence`} replace />}
      />

      <Route
        path=":locale"
        element={<LanguageLayout localeBrowser={appLang} />}
      >
        <Route path="create-sequence" element={<EditSequencesPage />} />
        <Route path="view-sequence" element={<ViewSequencePage />} />
      </Route>

      <Route path="*" element={<Navigate to={"/"} replace />} />
    </Routes>
  );
};

export default App;
