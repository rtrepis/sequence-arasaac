// Desat de la configuració d'usuari sense fer-ne esperar el tancament del modal.
//
// Els ajustos ja viuen a Redux abans de desar-los (els panells hi sincronitzen l'estat
// local de manera síncrona), així que la pantalla ja mostra el resultat: encadenar el
// tancament a una petició que pot trigar mig minut —el servei encara engegant-se—
// només serveix perquè l'usuari premi la creu tres vegades sense entendre res.
//
// Si el desat falla, el problema sí que necessita explicació: qui ha tancat el modal
// no s'espera cap error, i un snackbar de tres segons no diu ni què s'ha perdut ni què
// pot fer. Però abans d'avisar ningú es mira si val la pena tornar-ho a provar sol.
import { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch } from "../../../../app/hooks";
import { saveUserUiThunk } from "../store/settingsThunks";
import { useFeedback } from "../../../../context/FeedbackContext/FeedbackContext";
import messages from "../../../../Modals/DefaultSettingsModal/UserSettingsPanel.lang";
import { RequestFailure } from "@features/backend/api/requestFailure";
import { reportClientError } from "@features/backend/api/clientErrorReport";

// Marge perquè un servei que s'està engegant tingui temps d'acabar d'arrencar.
// Amb menys, el reintent cau dins la mateixa finestra dolenta i no serveix de res.
const TRANSIENT_RETRY_DELAY_MS = 8000;

interface UseSaveUiSettings {
  /** Llança el desat i torna de seguida: qui el crida no s'ha d'esperar. */
  saveInBackground: () => void;
  /** Torna a intentar el desat que ha fallat, a petició de l'usuari. */
  retry: () => void;
  /** Fallada que ha sobreviscut al reintent automàtic; null mentre no n'hi hagi. */
  failure: RequestFailure | null;
  /** Cert mentre corre un reintent demanat des del diàleg. */
  isRetrying: boolean;
  /** Tanca el diàleg d'error sense reintentar. */
  dismissError: () => void;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const useSaveUiSettings = (): UseSaveUiSettings => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();

  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  // Evita que dos tancaments seguits deixin dues cadenes de reintents en marxa
  const isSavingRef = useRef(false);

  // L'èxit es confirma amb un snackbar; la fallada la reporta qui crida,
  // perquè mereix més espai que una línia que marxa sola.
  const save = useCallback(async (): Promise<RequestFailure | null> => {
    const result = await dispatch(saveUserUiThunk());

    if (saveUserUiThunk.fulfilled.match(result)) {
      showSnackbar({
        message: intl.formatMessage(messages.saveSuccess),
        severity: "success",
      });
      return null;
    }

    return (
      result.payload ?? { code: "UNKNOWN_ERROR", isTransient: false }
    );
  }, [dispatch, intl, showSnackbar]);

  const saveInBackground = useCallback((): void => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    void (async () => {
      let result = await save();

      // Una fallada transitòria no és notícia: el servei encara s'estava engegant
      // o la connexió ha parpellejat. Es torna a provar un cop abans de dir res,
      // i només si el segon intent també falla apareix el diàleg.
      if (result?.isTransient) {
        await wait(TRANSIENT_RETRY_DELAY_MS);
        result = await save();
      }

      setFailure(result);
      isSavingRef.current = false;

      // S'informa del que ha arribat a l'usuari, no del que s'ha resolt sol
      if (result) void reportClientError("settings-save", result);
    })();
  }, [save]);

  const retry = useCallback((): void => {
    setIsRetrying(true);
    void save().then((result) => {
      setIsRetrying(false);
      setFailure(result);
    });
  }, [save]);

  const dismissError = useCallback((): void => setFailure(null), []);

  return { saveInBackground, retry, failure, isRetrying, dismissError };
};
