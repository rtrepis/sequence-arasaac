import { Snackbar, Alert } from "@mui/material";
import { ReactElement, SyntheticEvent } from "react";
import { useFeedback } from "./FeedbackContext";

// Amplada que el snackbar deixa lliure a la dreta per sota de `sm`: el
// DocumentStatusFab viu a `bottom: 16, right: 16` i fa 48 px, de manera que
// ocupa fins als 64 px del cantó; 72 hi afegeix la separació.
//
// Per sota de `sm`, el Snackbar de MUI s'estén de banda a banda (`left: 8,
// right: 8`) i tapava el botó flotant justament quan l'usuari acaba de desar i
// pot voler mirar on ha anat a parar la feina (troballa C7 de l'auditoria
// d'UX). Es mou el snackbar i no el botó perquè el botó és permanent i l'avís
// dura tres segons: el que és de pas és el que s'aparta.
//
// El marge es deixa sempre, també a les pàgines on el botó no es munta (inici,
// novetats, administració): condicionar-lo obligaria el snackbar a saber en
// quina ruta és, i el que s'hi guanya són 72 px d'amplada en un avís que ja hi
// cap.
const FAB_CLEARANCE_PX = 72;

// Component Snackbar que consumeix el context de feedback
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
      sx={(theme) => ({
        [theme.breakpoints.down("sm")]: { right: FAB_CLEARANCE_PX },
      })}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="standard"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbar;
