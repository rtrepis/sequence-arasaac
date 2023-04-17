import { Route, Routes } from "react-router-dom";
import "./App.css";
import EditSequencesPages from "./pages/EditSequencesPages/EditSequencesPages";
import ViewSequencePage from "./pages/ViewSequencePages/ViewSequencePage";
import { IntlProvider } from "react-intl";
import messages_en from "./languages/en.json";
import messages_es from "./languages/es.json";
import messages_ca from "./languages/ca.json";

const App = (): JSX.Element => {
  return (
    <>
      <Routes>
        <Route path="/" element={<EditSequencesPages />} />
        <Route path="create-sequence" element={<EditSequencesPages />} />
        <Route path="view-sequence" element={<ViewSequencePage />} />
      </Routes>
      <IntlProvider
        locale={navigator.language}
        defaultLocale="en"
        messages={messages_en}
      >
        <Routes>
          <Route path="/en">
            <>
              <Route path="create-sequence" element={<EditSequencesPages />} />
              <Route path="view-sequence" element={<ViewSequencePage />} />
            </>
          </Route>
        </Routes>
      </IntlProvider>
      <IntlProvider
        locale={navigator.language}
        defaultLocale="en"
        messages={messages_es}
      >
        <Routes>
          <Route path="/es">
            <>
              <Route path="create-sequence" element={<EditSequencesPages />} />
              <Route path="view-sequence" element={<ViewSequencePage />} />
            </>
          </Route>
        </Routes>
      </IntlProvider>
      <IntlProvider
        locale={navigator.language}
        defaultLocale="en"
        messages={messages_ca}
      >
        <Routes>
          <Route path="/ca">
            <>
              <Route path="create-sequence" element={<EditSequencesPages />} />
              <Route path="view-sequence" element={<ViewSequencePage />} />
            </>
          </Route>
        </Routes>
      </IntlProvider>
    </>
  );
};

export default App;
