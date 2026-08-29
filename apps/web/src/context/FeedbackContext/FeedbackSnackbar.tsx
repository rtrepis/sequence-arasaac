import { Snackbar, Alert } from "@mui/material";
import { ReactElement, SyntheticEvent } from "react";
import { useFeedback } from "./FeedbackContext";
import {
  floatingNoticeSx,
  floatingSnackbarSx,
} from "@components/FloatingLayer";

// Confirmació d'una acció acabada. A diferència dels dos avisos que no marxen
// sols (sessió caducada, servidor despertant-se), aquest **no** reserva espai al
// final del contingut: dura tres segons, i fer saltar la pàgina cada vegada que
// es desa alguna cosa seria pitjor que el que arregla.
const FeedbackSnackbar = (): ReactElement => {
  const { state, hideSnackbar } = useFeedback();
  const { open, message, severity, duration } = state.snackbar;

  const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    // No tancar si l'usuari clica fora
    if (reason === "clickaway") {
      return;
    }
    hideSnackbar();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={floatingSnackbarSx}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="outlined"
        sx={floatingNoticeSx}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbar;
