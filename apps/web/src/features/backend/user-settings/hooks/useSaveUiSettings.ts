// Desat de la configuració d'usuari sense fer-ne esperar el tancament del modal.
//
// Els ajustos ja viuen a Redux abans de desar-los (els panells hi sincronitzen l'estat
// local de manera síncrona), així que la pantalla ja mostra el resultat: encadenar el
// tancament a una petició que pot trigar mig minut —el servidor de Render adormit—
// només serveix perquè l'usuari premi la creu tres vegades sense entendre res.
//
// Si el desat falla, el problema sí que necessita explicació: qui ha tancat el modal
// no s'espera cap error, i un snackbar de tres segons no diu ni què s'ha perdut ni què
// pot fer. Per això la fallada s'exposa com a estat i qui el consumeix hi obre un diàleg.
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch } from "../../../../app/hooks";
import { saveUserUiThunk } from "../store/settingsThunks";
import { useFeedback } from "../../../../context/FeedbackContext/FeedbackContext";
import messages from "../../../../Modals/DefaultSettingsModal/UserSettingsPanel.lang";

interface UseSaveUiSettings {
  /** Llança el desat i torna de seguida: qui el crida no s'ha d'esperar. */
  saveInBackground: () => void;
  /** Torna a intentar el desat que ha fallat. */
  retry: () => void;
  /** Cert mentre el diàleg d'error ha de ser visible. */
  hasFailed: boolean;
  /** Cert mentre corre un reintent, per bloquejar el botó. */
  isRetrying: boolean;
  /** Tanca el diàleg d'error sense reintentar. */
  dismissError: () => void;
}

export const useSaveUiSettings = (): UseSaveUiSettings => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();

  const [hasFailed, setHasFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // L'èxit es confirma amb un snackbar; la fallada la reporta qui crida,
  // perquè mereix més espai que una línia que marxa sola.
  const save = useCallback(async (): Promise<boolean> => {
    const result = await dispatch(saveUserUiThunk());
    const isSaved = saveUserUiThunk.fulfilled.match(result);

    if (isSaved) {
      showSnackbar({
        message: intl.formatMessage(messages.saveSuccess),
        severity: "success",
      });
    }
    return isSaved;
  }, [dispatch, intl, showSnackbar]);

  const saveInBackground = useCallback((): void => {
    void save().then((isSaved) => setHasFailed(!isSaved));
  }, [save]);

  const retry = useCallback((): void => {
    setIsRetrying(true);
    void save().then((isSaved) => {
      setIsRetrying(false);
      setHasFailed(!isSaved);
    });
  }, [save]);

  const dismissError = useCallback((): void => setHasFailed(false), []);

  return { saveInBackground, retry, hasFailed, isRetrying, dismissError };
};
