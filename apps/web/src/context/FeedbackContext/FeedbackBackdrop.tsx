import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";
import { ReactElement } from "react";
import { useIntl } from "react-intl";
import { useFeedback } from "./FeedbackContext";
import messages from "./FeedbackContext.lang";

// Component Backdrop que consumeix el context de feedback per operacions bloquejants
const FeedbackBackdrop = (): ReactElement => {
  const { state } = useFeedback();
  const intl = useIntl();
  const { open, message } = state.backdrop;

  // Etiqueta accessible: el missatge del context si n'hi ha, o el genèric de "Loading"
  const label = message || intl.formatMessage(messages.loading);

  return (
    <Backdrop
      // role="status" i no role="alert": és informació d'estat, no una alarma.
      // Sense això, una operació que bloqueja la pantalla mig minut no s'anuncia
      // enlloc i qui no la veu no té cap manera de saber que està passant.
      role="status"
      aria-live="polite"
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
        gap: 2,
      }}
      open={open}
    >
      {/* Amb missatge, el text ja és el que s'anuncia i la rodona és decoració;
          sense missatge, la rodona és l'únic que hi ha i li cal nom propi */}
      <CircularProgress
        color="inherit"
        aria-hidden={message ? true : undefined}
        aria-label={message ? undefined : label}
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
