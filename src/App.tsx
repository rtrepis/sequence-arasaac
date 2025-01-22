import { Route, Routes } from "react-router-dom";
import "./App.css";
import ViewSequencePage from "./pages/ViewSequencePage/ViewSequencePage";
import { IntlProvider } from "react-intl";
import messages_en from "./languages/en.json";
import messages_es from "./languages/es.json";
import messages_ca from "./languages/ca.json";
import EditSequencesPage from "./pages/EditSequencesPage/EditSequencesPage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { updateDefaultSettingsActionCreator } from "./app/slice/uiSlice";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import React from "react";
import { usePageTracking } from "./hooks/usePageTracking";

const App = ({ locale }: { locale: string }): React.ReactElement => {
  usePageTracking();
  const dispatch = useDispatch();

  const messageLocale = {
    ca: messages_ca,
    es: messages_es,
    en: messages_en,
  };

  useEffect(() => {
    const isPictDefaultSettings = localStorage.getItem("pictDefaultSettings");
    if (isPictDefaultSettings != null) {
      const userDefaultSettings = JSON.parse(isPictDefaultSettings);
      dispatch(updateDefaultSettingsActionCreator(userDefaultSettings));
    }
  }, [dispatch]);

  return (
    <>
      <IntlProvider
        locale={locale}
        defaultLocale="ca"
        messages={messageLocale[locale]}
      >
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="create-sequence" element={<EditSequencesPage />} />
          <Route path="view-sequence" element={<ViewSequencePage />} />
        </Routes>
      </IntlProvider>
      <IntlProvider locale={"en"} defaultLocale="en" messages={messages_en}>
        <Routes>
          <Route path="en">
            <Route path="create-sequence" element={<EditSequencesPage />} />
            <Route path="view-sequence" element={<ViewSequencePage />} />
          </Route>
        </Routes>
      </IntlProvider>
      <IntlProvider locale={"es"} defaultLocale="es" messages={messages_es}>
        <Routes>
          <Route path="es">
            <Route path="create-sequence" element={<EditSequencesPage />} />
            <Route path="view-sequence" element={<ViewSequencePage />} />
          </Route>
        </Routes>
      </IntlProvider>
      <IntlProvider locale={"ca"} defaultLocale="ca" messages={messages_ca}>
        <Routes>
          <Route path="ca">
            <Route path="create-sequence" element={<EditSequencesPage />} />
            <Route path="view-sequence" element={<ViewSequencePage />} />
          </Route>
        </Routes>
      </IntlProvider>
    </>
  );
};

export default App;
