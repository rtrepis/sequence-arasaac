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
import TryPage from "./pages/TryPage/TryPage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";

const App = (): JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    const isPictDefaultSettings = localStorage.getItem("pictDefaultSettings");
    if (isPictDefaultSettings != null) {
      const userDefaultSettings = JSON.parse(isPictDefaultSettings);
      dispatch(updateDefaultSettingsActionCreator(userDefaultSettings));
    }
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="create-sequence" element={<EditSequencesPage />} />
        <Route path="view-sequence" element={<ViewSequencePage />} />
        <Route path="try" element={<TryPage></TryPage>} />
      </Routes>
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
