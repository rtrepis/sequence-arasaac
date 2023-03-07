import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { sequenceReducer } from "../app/slice/sequenceSlice";
import { ThemeProvider } from "@mui/system";
import theme from "../materiaUi/theme";
import { CssBaseline } from "@mui/material";
import { IntlProvider } from "react-intl";
import messages from "../languages/en.json";

interface WrapperProps {
  children: JSX.Element | JSX.Element[];
}

const render = (
  ui: JSX.Element,
  {
    preloadedState,
    store = configureStore({
      reducer: {
        sequence: sequenceReducer,
      },
      preloadedState: {
        sequence: [
          {
            index: 0,
            number: 26527,
            border: {
              in: { color: "blue", radius: 20, size: 2 },
              out: { color: "green", radius: 20, size: 2 },
            },
          },
        ],
      },
    }),
    ...renderOptions
  }: { preloadedState?: any; store?: any } = {}
) => {
  const Wrapper = ({ children }: WrapperProps): JSX.Element => {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <IntlProvider locale={"en"} defaultLocale="en" messages={messages}>
            {children}
          </IntlProvider>
        </ThemeProvider>
      </Provider>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";
export { render, rtlRender };
