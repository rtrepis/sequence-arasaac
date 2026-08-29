import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";
import { ReactElement } from "react";
import { useFeedback } from "./FeedbackContext";

// Component Backdrop que consumeix el context de feedback per operacions bloquejants.
//
// Es munta fora del router i, per tant, fora de l'IntlProvider (vegeu index.tsx):
// aquí no es pot traduir res. El text sempre l'aporta qui obre el backdrop, que sí
// que viu dins de l'arbre traduït.
const FeedbackBackdrop = (): ReactElement => {
  const { state } = useFeedback();
  const { open, message } = state.backdrop;

  return (
    <Backdrop
      // role="status" i no role="alert": és informació d'estat, no una alarma.
      // Sense això, una operació que bloqueja la pantalla mig minut no s'anuncia
      // enlloc i qui no la veu no té cap manera de saber que està passant.
      role="status"
      aria-live="polite"
      sx={{
        color: "common.white",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
        gap: 2,
      }}
      open={open}
    >
      {/* Amb missatge, el text és el que s'anuncia i la rodona només és decoració */}
      <CircularProgress
        color="inherit"
        aria-hidden={message ? true : undefined}
      />
      {message && (
        <Box>
          <Typography variant="body1">{message}</Typography>
        </Box>
      )}
    </Backdrop>
  );
};

export default FeedbackBackdrop;
