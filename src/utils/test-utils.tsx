import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { sequenceReducer } from "../app/slice/sequenceSlice";
import { ThemeProvider } from "@mui/system";
import theme from "../style/themeMui";
import { CssBaseline } from "@mui/material";
import { IntlProvider } from "react-intl";
import messages from "../languages/en.json";
import { uiReducer } from "../app/slice/uiSlice";
import { Sequence } from "../types/sequence";
import { Ui } from "../types/ui";

interface WrapperProps {
  children: JSX.Element | JSX.Element[];
}

export interface State {
  sequence: Sequence;
  ui: Ui;
}

const preloadedState: State = {
  sequence: [
    {
      indexSequence: 0,
      img: {
        searched: { word: "test", bestIdPicts: [11, 22, 33] },
        selectedId: 26527,
        settings: { skin: "black" },
      },
      text: "test",
      settings: {
        numbered: true,
        textPosition: "bottom",
        borderIn: { color: "blue", radius: 20, size: 2 },
        borderOut: { color: "green", radius: 20, size: 2 },
      },
    },
  ],
  ui: {
    view: false,
    defaultSettings: {
      pictApiAra: { skin: "white", fitzgerald: "#998800" },
      pictSequence: {
        numbered: true,
        textPosition: "bottom",
        borderIn: { color: "fitzgerald", radius: 20, size: 2 },
        borderOut: { color: "#999999", radius: 20, size: 2 },
      },
    },
  },
};

const render = (
  ui: JSX.Element,
  {
    preloadedState,
    store = configureStore({
      reducer: {
        sequence: sequenceReducer,
        ui: uiReducer,
      },
      preloadedState: preloadedState,
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
export { render, rtlRender, preloadedState };
