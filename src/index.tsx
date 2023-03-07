import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import theme from "./materiaUi/theme";
import { IntlProvider } from "react-intl";
import loadLocalMessages from "./lang/loadLocaleMessages";

const locale = navigator.language;

const container = document.getElementById("root")!;
const root = createRoot(container);

const languages = async (locale: string) => {
  const messages = (await loadLocalMessages(locale)) as any;

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
            <App />
          </IntlProvider>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  );
};

languages(locale);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
