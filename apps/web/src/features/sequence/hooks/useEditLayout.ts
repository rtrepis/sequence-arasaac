// Quina pantalla d'edició es veu (pla dels estils, pas 10; D26 i Q4).
//
// Al mòbil, sempre la nova. A l'escriptori, la nova és una **vista de prova**
// durant un temps: l'usuari hi passa i en torna amb l'interruptor de l'edició
// (`EditLayoutSwitch`), i la tria es recorda **en aquest navegador**. És una
// preferència d'interfície: no entra mai al document, i no va al compte perquè
// la vista d'abans es retirarà (B42) i la preferència amb ella.
import { useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

export type EditLayout = "new" | "classic";

const EDIT_LAYOUT_KEY = "editLayout";

/** La tria desada; sense tria (o sense accés al navegador), la d'abans */
const readStoredLayout = (): EditLayout => {
  try {
    return localStorage.getItem(EDIT_LAYOUT_KEY) === "new" ? "new" : "classic";
  } catch {
    return "classic";
  }
};

const storeLayout = (layout: EditLayout): void => {
  try {
    localStorage.setItem(EDIT_LAYOUT_KEY, layout);
  } catch {
    // Sense accés al navegador, la tria val per a aquesta visita i prou
  }
};

interface EditLayoutState {
  /** Es pinta la pantalla nova (capçalera, graella i barra de baix) */
  isNew: boolean;
  /** Es pot triar: a l'escriptori sí, al mòbil no (sempre la nova) */
  canChoose: boolean;
  choose: (layout: EditLayout) => void;
}

const useEditLayout = (): EditLayoutState => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [preferred, setPreferred] = useState<EditLayout>(readStoredLayout);

  const choose = (layout: EditLayout) => {
    setPreferred(layout);
    storeLayout(layout);
  };

  return {
    isNew: isMobile || preferred === "new",
    canChoose: !isMobile,
    choose,
  };
};

export default useEditLayout;
