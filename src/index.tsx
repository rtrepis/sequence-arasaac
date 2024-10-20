import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import theme from "./style/themeMui";
import { IntlProvider } from "react-intl";
import loadLocalMessages from "./languages/loadLocaleMessages";
import { BrowserRouter } from "react-router-dom";

const locale = navigator.language.slice(0, 2);

const container = document.getElementById("root")!;
const root = createRoot(container);

const languages = async (locale: string) => {
  const messages = (await loadLocalMessages(locale)) as unknown;

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <BrowserRouter>
            <IntlProvider
              locale={locale}
              defaultLocale="ca"
              messages={messages}
            >
              <App />
            </IntlProvider>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>,
  );
};

languages(locale);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
