import { ReactElement, ReactNode } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";
import { AppStore, createAppStore, RootState } from "@app/store";
import { buildTheme } from "@/style/themeMui";
import { FeedbackProvider } from "@/context/FeedbackContext";
import { toMessages } from "@sequence-arasaac/i18n";
import en from "@sequence-arasaac/i18n/messages/app/en.json";

// Textos en anglès, carregats d'una vegada: els tests no esperen cap fragment
const messages = toMessages(en);

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /**
   * Estat de partida. Cada slice que es passi **se substitueix sencer**: per
   * tocar-ne un sol camp val més crear l'store, despatxar-hi l'acció de debò i
   * passar-la amb `store` — així el test no ha de conèixer la resta del slice.
   */
  preloadedState?: Partial<RootState>;
  /** Store ja feta, per compartir-la entre dos renders del mateix cas. */
  store?: AppStore;
}

/**
 * Munta un component amb la mateixa pila de proveïdors que l'app
 * (`index.tsx`): store de debò, tema, traduccions, feedback i rutes.
 *
 * Els tests no declaren cap mapa de reducers ni cap estat sencer: demanen a
 * `createAppStore` el de l'app i només hi posen el tros que el cas necessita.
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState,
    store = createAppStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Provider store={store}>
      <ThemeProvider theme={buildTheme("light")}>
        <CssBaseline enableColorScheme />
        <FeedbackProvider>
          <BrowserRouter>
            <IntlProvider locale="en" defaultLocale="en" messages={messages}>
              {children}
            </IntlProvider>
          </BrowserRouter>
        </FeedbackProvider>
      </ThemeProvider>
    </Provider>
  );

  return { store, ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
