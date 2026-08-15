// Avís no bloquejant mentre el servidor es desperta.
//
// No bloqueja a propòsit: l'editor de seqüències funciona sencer sense backend, i
// enfosquir la pantalla mig minut impediria treballar just per una espera que no
// afecta el que l'usuari té a la pantalla.
import { ReactElement } from "react";
import { Alert, AlertTitle, LinearProgress, Snackbar } from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./BackendWakeUpNotice.lang";
import { useIsBackendWakingUp } from "./useBackendWakeUp";

const BackendWakeUpNotice = (): ReactElement | null => {
  const intl = useIntl();
  const isWakingUp = useIsBackendWakingUp();

  if (!isWakingUp) return null;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      // Sense autoHideDuration: l'avís marxa quan el servidor respon, no per rellotge.
      // Amagar-lo abans deixaria l'usuari esperant sense explicació una altra vegada.
    >
      <Alert
        severity="info"
        variant="outlined"
        // role="status" i no el role="alert" per defecte: és informació d'estat, no una
        // urgència que hagi d'interrompre el lector de pantalla enmig d'una altra lectura.
        role="status"
        // L'outlined de MUI és transparent; sobre contingut, el text quedaria il·legible.
        sx={{ width: "100%", bgcolor: "background.paper" }}
      >
        <AlertTitle>{intl.formatMessage(messages.title)}</AlertTitle>
        {intl.formatMessage(messages.description)}
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
