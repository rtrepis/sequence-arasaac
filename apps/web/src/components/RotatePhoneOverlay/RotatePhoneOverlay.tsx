// La capa del mòbil girat (`docs/estandards/capes-flotants.md`, «La capa del
// mòbil girat»). Genèrica: el text el posa qui la munta, que és una pàgina que
// només es treballa amb el mòbil dret (avui, la vista: M6 i N3 de
// `docs/plans/fets/PLA-vista-mobil.md`).
import React, { useEffect, useState } from "react";
import { Box, Typography, keyframes, useMediaQuery } from "@mui/material";
import { MdScreenRotation } from "react-icons/md";
import { rotateVeil } from "@/style/palette";

/** Si hi ha res a pantalla completa. */
const useIsFullscreen = (): boolean => {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  return fullscreen;
};

/**
 * Un mòbil girat: tàctil, apaïsat i baix. L'amplada no hi compta, perquè un
 * mòbil girat pot passar de `md` i la disposició de sota canviaria; l'alçada
 * deixa fora les tauletes, que girades sí que es treballen.
 */
const TURNED_PHONE =
  "(orientation: landscape) and (pointer: coarse) and (max-height: 500px)";

/** La icona fa el gest: de girada a dreta, i torna a començar. */
const turn = keyframes`
  0%, 20% { transform: rotate(-90deg); }
  45%, 80% { transform: rotate(0deg); }
  100% { transform: rotate(-90deg); }
`;

interface RotatePhoneOverlayProps {
  /** Què cal fer i per què: «Gira el mòbil: …» */
  message: string;
}

/**
 * No es tanca: desapareix en tornar a posar el mòbil dret. No surt a la
 * pantalla completa, que girada sí que té sentit. Es llegeix com a
 * `role="status"`, i amb `prefers-reduced-motion` la icona no es mou.
 */
const RotatePhoneOverlay = ({
  message,
}: RotatePhoneOverlayProps): React.ReactElement | null => {
  const turned = useMediaQuery(TURNED_PHONE);
  const fullscreen = useIsFullscreen();
  if (!turned || fullscreen) return null;

  return (
    <Box
      role="status"
      sx={(theme) => ({
        position: "fixed",
        inset: 0,
        // Per damunt de tot el que hi ha a la pàgina, també del panell i la barra
        zIndex: theme.zIndex.modal + 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: 3,
        textAlign: "center",
        // El fons de l'escriptori del tema, translúcid: blanc en clar, negre en fosc
        backgroundColor: rotateVeil[theme.palette.mode].background,
        color: rotateVeil[theme.palette.mode].text,
        "@media print": { display: "none" },
      })}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          display: "flex",
          fontSize: 72,
          animation: `${turn} 2.4s ease-in-out infinite`,
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        <MdScreenRotation />
      </Box>
      <Typography component="p" variant="h6" fontWeight="bold">
        {message}
      </Typography>
    </Box>
  );
};

export default RotatePhoneOverlay;
