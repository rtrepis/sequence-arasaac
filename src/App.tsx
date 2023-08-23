import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ViewSequencePage from "./pages/ViewSequencePage/ViewSequencePage";
import { IntlProvider } from "react-intl";
import messages_en from "./languages/en.json";
import messages_es from "./languages/es.json";
import messages_ca from "./languages/ca.json";
import EditSequencesPage from "./pages/EditSequencesPage/EditSequencesPage";

const App = (): JSX.Element => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={"create-sequence"} />} />
        <Route path="create-sequence" element={<EditSequencesPage />} />
        <Route path="view-sequence" element={<ViewSequencePage />} />
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
