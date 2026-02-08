import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";
import { ReactElement } from "react";
import { useFeedback } from "./FeedbackContext";

// Component Backdrop que consumeix el context de feedback per operacions bloquejants
const FeedbackBackdrop = (): ReactElement => {
  const { state } = useFeedback();
  const { open, message } = state.backdrop;

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
        gap: 2,
      }}
      open={open}
    >
      <CircularProgress color="inherit" />
      {message && (
        <Box>
          <Typography variant="body1">{message}</Typography>
        </Box>
      )}
    </Backdrop>
  );
};

export default FeedbackBackdrop;
