import { Slide, useScrollTrigger } from "@mui/material";
import React from "react";
import { useFloatingRaised } from "@components/FloatingLayer";

/** L'alçada de la barra de l'app, en px (`BarNavigation`). */
export const APP_BAR_HEIGHT = 42;

interface HideOnScrollProps {
  children: React.ReactElement;
}

const HideOnScroll = ({ children }: HideOnScrollProps) => {
  const trigger = useScrollTrigger({
    target: undefined,
  });
  // Un panell de baix a mig o a sencer també l'amaga, perquè el que hi ha a
  // sobre del panell en guanyi l'alçada (M5 de `docs/plans/fets/PLA-vista-mobil.md`). El
  // panell no sap res de la barra: ho diu amb un senyal genèric
  const raised = useFloatingRaised();

  return (
    <Slide appear={false} direction="down" in={!trigger && !raised}>
      {children}
    </Slide>
  );
};

export default HideOnScroll;
