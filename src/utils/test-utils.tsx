import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { store } from "../app/store";
import { sequenceReducer } from "../app/slice/sequenceSlice";
import { act } from "react-dom/test-utils";
import { ThemeProvider } from "@mui/system";
import theme from "../materiaUi/theme";
import { CssBaseline } from "@mui/material";

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
        sequence: [{ index: 0, number: 0, border: "none" }],
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
          {children}
        </ThemeProvider>
      </Provider>
    );
  };
  return act(() => {
    rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
  });
};

const Wrapper = ({ children }: WrapperProps): JSX.Element => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </Provider>
  );
};

export default Wrapper;

export * from "@testing-library/react";
export { render, Wrapper, rtlRender };
