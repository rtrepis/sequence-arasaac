import { Slide, useScrollTrigger } from "@mui/material";
import React from "react";

/** L'alçada de la barra de l'app, en px (`BarNavigation`). */
export const APP_BAR_HEIGHT = 42;

/**
 * Si la barra de l'app està amagada: en baixar més que la seva alçada, se'n
 * va, i en pujar torna. El fa servir també el que s'enganxa a dalt de la
 * finestra (la previsualització del mòbil), per quedar just a sota de la barra
 * quan es veu.
 */
export const useAppBarHidden = (): boolean =>
  useScrollTrigger({ target: undefined, threshold: APP_BAR_HEIGHT });

interface HideOnScrollProps {
  children: React.ReactElement;
}

const HideOnScroll = ({ children }: HideOnScrollProps) => {
  const trigger = useAppBarHidden();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

export default HideOnScroll;
