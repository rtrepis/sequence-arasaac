// Avís no bloquejant mentre el servidor es desperta.
//
// No bloqueja a propòsit: l'editor de seqüències funciona sencer sense backend, i
// enfosquir la pantalla mig minut impediria treballar just per una espera que no
// afecta el que l'usuari té a la pantalla.
import { ReactElement } from "react";
import { Alert, AlertTitle, LinearProgress, Snackbar } from "@mui/material";
import {
  floatingNoticeSx,
  floatingSnackbarSx,
  useFloatingInset,
} from "@components/FloatingLayer";
import { useIntl } from "react-intl";
import messages from "./BackendWakeUpNotice.lang";
import { useIsBackendWakingUp } from "./useBackendWakeUp";
import { useFeedback } from "../../../context/FeedbackContext/FeedbackContext";

const BackendWakeUpNotice = (): ReactElement | null => {
  const intl = useIntl();
  const isWakingUp = useIsBackendWakingUp();
  const { state } = useFeedback();
  // Abans de la sortida per `null`: un hook no pot quedar darrere d'un return
  const insetRef = useFloatingInset("backend-wake-up");

  // Amb el backdrop obert la pantalla està bloquejada: convidar a seguir editant
  // seria una promesa falsa, perquè l'usuari no pot tocar res fins que acabi.
  const isBlocked = state.backdrop.open;

  if (!isWakingUp) return null;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={floatingSnackbarSx}
      // Sense autoHideDuration: l'avís marxa quan el servidor respon, no per rellotge.
      // Amagar-lo abans deixaria l'usuari esperant sense explicació una altra vegada.
    >
      <Alert
        // Mesura't i reserva el teu espai al final del contingut: aquest avís
        // no marxa fins que respon el servidor, i mentrestant tapa la feina
        ref={insetRef}
        severity="info"
        variant="outlined"
        // role="status" i no el role="alert" per defecte: és informació d'estat, no una
        // urgència que hagi d'interrompre el lector de pantalla enmig d'una altra lectura.
        role="status"
        sx={floatingNoticeSx}
      >
        <AlertTitle>{intl.formatMessage(messages.title)}</AlertTitle>
        {intl.formatMessage(
          isBlocked ? messages.descriptionBlocking : messages.description,
        )}
        <LinearProgress
          color="inherit"
          // El text ja diu que s'està esperant; la barra només ho acompanya visualment
          aria-hidden
          sx={{ mt: 1, borderRadius: 1 }}
        />
      </Alert>
    </Snackbar>
  );
};

export default BackendWakeUpNotice;
