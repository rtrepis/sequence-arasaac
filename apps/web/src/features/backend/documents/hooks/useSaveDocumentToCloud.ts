// Desat al núvol des d'on l'usuari sigui: el drawer i el botó flotant d'estat
// criden el mateix codi. Duplicar-lo hauria acabat amb dos textos d'error
// diferents per a la mateixa fallada.
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";
import { saveDocumentThunk } from "@features/sequence/store/documentSlice";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import { useFeedback } from "@/context/FeedbackContext";
import authMessages from "@features/backend/auth/components/AuthModal.lang";

const selectDocument = (state: RootState) => state.document;

export const useSaveDocumentToCloud = (): {
  saveToCloud: () => Promise<void>;
} => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const document = useAppSelector(selectDocument);
  const { showSnackbar, showBackdrop, hideBackdrop } = useFeedback();

  const saveToCloud = useCallback(async () => {
    // Missatge concret i no un "carregant" genèric: si el servidor de Render dorm,
    // aquest text pot ser l'únic que l'usuari tingui davant durant mig minut
    showBackdrop({ message: intl.formatMessage(authMessages.savingDocument) });
    const result = await dispatch(saveDocumentThunk(document));
    hideBackdrop();

    if (result.meta.requestStatus === "fulfilled") {
      dispatch(documentMadeDurableActionCreator({ kind: "cloud" }));
      showSnackbar({
        message: intl.formatMessage(authMessages.documentSaved),
        severity: "success",
      });
      return;
    }

    // El thunk retorna el codi d'error del backend; aquí es converteix en text
    const errorCode = result.payload as string;
    const message =
      authMessages[errorCode as keyof typeof authMessages] ??
      authMessages.DOCUMENT_SAVE_ERROR;
    showSnackbar({
      // El codi va amb el missatge: qui només vol treballar l'ignora, i qui ha de
      // mirar què ha passat no depèn d'una consola que al mòbil no existeix
      message: intl.formatMessage(authMessages.errorWithCode, {
        message: intl.formatMessage(message),
        code: errorCode,
      }),
      severity: "error",
      // Més estona que el d'èxit: un error s'ha de poder llegir i, si cal, copiar
      duration: 10000,
    });
  }, [dispatch, document, hideBackdrop, intl, showBackdrop, showSnackbar]);

  return { saveToCloud };
};

export default useSaveDocumentToCloud;
