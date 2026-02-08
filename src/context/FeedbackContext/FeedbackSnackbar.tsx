import { Snackbar, Alert } from "@mui/material";
import { ReactElement } from "react";
import { useFeedback } from "./FeedbackContext";

// Component Snackbar que consumeix el context de feedback
const FeedbackSnackbar = (): ReactElement => {
  const { state, hideSnackbar } = useFeedback();
  const { open, message, severity, duration } = state.snackbar;

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
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
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
