import { LinearProgress, Paper, Fade } from "@mui/material";
import { ReactElement } from "react";
import { useFeedback } from "./FeedbackContext";

// Component de barra de progrés que consumeix el context de feedback
const FeedbackProgress = (): ReactElement => {
  const { state } = useFeedback();
  const { open, current, total } = state.progress;

  // Calcular el percentatge de progrés
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Fade in={open}>
      <Paper
        elevation={6}
        sx={{
          width: "100%",
        }}
      >
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>
    </Fade>
  );
};

export default FeedbackProgress;
