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
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { saveUserUiThunk } from "../store/settingsThunks";
import { refreshQuotaThunk } from "../store/quotaSlice";
import { useFeedback } from "@/context/FeedbackContext";
import messages from "./useSaveUiSettings.lang";
import { RequestFailure } from "@features/backend/api/requestFailure";
import { reportClientError } from "@features/backend/api/clientErrorReport";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";

// Marge perquè un servei que s'està engegant tingui temps d'acabar d'arrencar.
// Amb menys, el reintent cau dins la mateixa finestra dolenta i no serveix de res.
const TRANSIENT_RETRY_DELAY_MS = 8000;

interface SaveOptions {
  /**
   * Confirmació pròpia en comptes de la genèrica: «Desa com a estil per
   * defecte» ha de dir què s'ha desat, no només que s'ha desat alguna cosa.
   */
  successMessage?: string;
}

interface UseSaveUiSettings {
  /** Llança el desat i torna de seguida: qui el crida no s'ha d'esperar. */
  saveInBackground: (options?: SaveOptions) => void;
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
  // Qui decideix si el desat va al compte o al navegador; el refresc del consum
  // en penja igual que el desat mateix
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  // Evita que dos tancaments seguits deixin dues cadenes de reintents en marxa
  const isSavingRef = useRef(false);

  // L'èxit es confirma amb un snackbar; la fallada la reporta qui crida,
  // perquè mereix més espai que una línia que marxa sola.
  const save = useCallback(
    async (successMessage?: string): Promise<RequestFailure | null> => {
      const result = await dispatch(saveUserUiThunk());

      if (saveUserUiThunk.fulfilled.match(result)) {
        // El vocabulari pot haver pujat o tret imatges: el consum del compte ja
        // no és el que deia abans de desar.
        //
        // Només quan el desat hi ha anat de debò. Sense sessió —i, per tant,
        // sempre amb les funcions de compte apagades— el que s'acaba de desar és
        // al navegador: no hi ha cap consum que hagi canviat, i la petició només
        // servia per despertar Render i, passats els 3 s del llindar, encendre
        // l'avís de «Connectant amb el teu compte…» a qui no en té cap.
        if (isLoggedIn) void dispatch(refreshQuotaThunk());
        showSnackbar({
          message: successMessage ?? intl.formatMessage(messages.saveSuccess),
          severity: "success",
        });
        return null;
      }

      if (result.payload) return result.payload;

      // Xarxa de seguretat: el thunk s'ha rebutjat sense passar per rejectWithValue.
      // Passa quan hi llança una excepció, i llavors el missatge és l'única pista
      // de què ha fallat: es conserva per al registre d'errors.
      return {
        code: "UNKNOWN_ERROR",
        isTransient: false,
        detail: result.error?.message?.slice(0, 300),
      };
    },
    [dispatch, intl, showSnackbar, isLoggedIn],
  );

  const saveInBackground = useCallback(
    (options?: SaveOptions): void => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      void (async () => {
        let result = await save(options?.successMessage);

        // Una fallada transitòria no és notícia: el servei encara s'estava engegant
        // o la connexió ha parpellejat. Es torna a provar un cop abans de dir res,
        // i només si el segon intent també falla apareix el diàleg.
        if (result?.isTransient) {
          await wait(TRANSIENT_RETRY_DELAY_MS);
          result = await save(options?.successMessage);
        }

        setFailure(result);
        isSavingRef.current = false;

        // S'informa del que ha arribat a l'usuari, no del que s'ha resolt sol
        if (result) void reportClientError("settings-save", result);
      })();
    },
    [save],
  );

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
