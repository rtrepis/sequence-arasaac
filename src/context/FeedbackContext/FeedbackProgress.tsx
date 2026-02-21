import { LinearProgress, Paper, Fade } from "@mui/material";
import { ReactElement } from "react";
import { useIntl } from "react-intl";
import { useFeedback } from "./FeedbackContext";
import messages from "./FeedbackContext.lang";

// Component de barra de progrés que consumeix el context de feedback
const FeedbackProgress = (): ReactElement => {
  const { state } = useFeedback();
  const intl = useIntl();
  const { open, current, total, message } = state.progress;

  // Calcular el percentatge de progrés
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  // Etiqueta accessible: usa el missatge del context si n'hi ha, o el genèric de "Loading"
  const progressLabel = message || intl.formatMessage(messages.loading);

  return (
    <Fade in={open}>
      {/* aria-busy indica a lectors de pantalla que l'àrea s'està carregant */}
      <Paper
        elevation={6}
        aria-busy={open}
        sx={{
          width: "100%",
        }}
      >
        <LinearProgress
          variant="determinate"
          value={percentage}
          aria-label={progressLabel}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>
    </Fade>
  );
};

export default FeedbackProgress;
