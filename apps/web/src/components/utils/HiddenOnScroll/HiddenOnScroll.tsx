import { Slide, useScrollTrigger } from "@mui/material";
import React from "react";

/** L'alçada de la barra de l'app, en px (`BarNavigation`). */
export const APP_BAR_HEIGHT = 42;

interface HideOnScrollProps {
  children: React.ReactElement;
}

const HideOnScroll = ({ children }: HideOnScrollProps) => {
  const trigger = useScrollTrigger({
    target: undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

export default HideOnScroll;
