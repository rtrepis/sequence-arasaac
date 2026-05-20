import { ReactNode, ReactElement } from "react";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import { useAppSelector } from "../hooks";
import { buildTheme } from "../../style/themeMui";

interface ThemeWrapperProps {
  children: ReactNode;
}

const ThemeWrapper = ({ children }: ThemeWrapperProps): ReactElement => {
  const themeMode = useAppSelector((store) => store.ui.theme);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const resolvedMode: "light" | "dark" =
    !themeMode || themeMode === "system"
      ? prefersDark ? "dark" : "light"
      : themeMode;

  return (
    <ThemeProvider theme={buildTheme(resolvedMode)}>{children}</ThemeProvider>
  );
};

export default ThemeWrapper;
