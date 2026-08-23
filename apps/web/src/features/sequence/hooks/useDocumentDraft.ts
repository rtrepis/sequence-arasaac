// Autodesat de l'esborrany del document al navegador.
//
// La configuració ja sobreviu sola a un refresc (settingsStorage), i això crea
// l'expectativa raonable que la seqüència també ho faci. No era així: fins ara
// només es conservava prement «Descarrega» o «Desa al núvol», i un refresc
// accidental s'enduia la feina sense cap avís.
import { useCallback, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";
import { loadDocumentSaacActionCreator } from "@features/sequence/store/documentSlice";
import { readDraft, saveDraft } from "@features/sequence/storage/draftStorage";
import {
  documentStatusRestoredActionCreator,
  draftSavedActionCreator,
  draftSaveFailedActionCreator,
} from "@features/sequence/store/documentStatusSlice";
import { useFeedback } from "@/context/FeedbackContext";
import { DocumentSAAC } from "@/types/document";
import messages from "../components/DocumentDraftSync.lang";

// Prou curt perquè no es perdi res en tancar de cop, prou llarg perquè
// arrossegar un slider no dispari una escriptura per moviment
const DRAFT_SAVE_DELAY_MS = 1000;

const selectDocument = (state: RootState): DocumentSAAC => state.document;

// Es tria l'objecte sencer i no un de nou amb els dos camps: un objecte
// construït al selector és una referència nova a cada acció de l'app i faria
// re-renderitzar per res
const selectStatus = (state: RootState) => state.documentStatus;

/**
 * Un document «verge» és el que crea documentSlice en arrencar: sense títol i
 * sense cap pictograma. Ni s'hi restaura res a sobre ni se'n desa cap còpia —
 * desar-lo només serviria per esborrar l'esborrany bo.
 */
const isPristineDocument = (document: DocumentSAAC): boolean => {
  const sequences = Object.values(document.content);

  return (
    document.title === undefined &&
    sequences.length <= 1 &&
    sequences.every((sequence) => sequence.length === 0)
  );
};

export const useDocumentDraft = (): void => {
  const dispatch = useAppDispatch();
  const document = useAppSelector(selectDocument);
  const { showSnackbar } = useFeedback();
  const intl = useIntl();

  // El document del moment en què s'escriu, no el del render que va programar
  // l'escriptura: entre l'un i l'altre hi ha el temps del debounce
  const documentRef = useRef(document);
  documentRef.current = document;

  // La durabilitat es desa dins de l'esborrany, però no ha de reprogramar-ne
  // cap escriptura: per això va en una ref i no a les dependències de l'efecte
  const status = useAppSelector(selectStatus);
  const statusRef = useRef(status);
  statusRef.current = status;

  // L'últim document que s'ha arribat a escriure. El flush de `visibilitychange`
  // salta cada cop que s'amaga la pestanya, i sense això reescriuria el mateix
  // document una vegada i una altra sense que hagi canviat res
  const persistedRef = useRef<DocumentSAAC | null>(null);

  // L'avís de «no s'ha pogut desar» surt un sol cop: si l'espai s'ha acabat,
  // cada canvi posterior tornaria a fallar i el convertiria en soroll
  const hasWarnedRef = useRef(false);

  const persist = useCallback(async () => {
    const current = documentRef.current;
    if (isPristineDocument(current) || current === persistedRef.current) return;

    const savedAt = Date.now();
    const { durableAt, durableKind } = statusRef.current;
    const saved = await saveDraft(current, { savedAt, durableAt, durableKind });

    if (saved) {
      persistedRef.current = current;
      dispatch(draftSavedActionCreator(savedAt));
      return;
    }

    dispatch(draftSaveFailedActionCreator());
    if (hasWarnedRef.current) return;

    hasWarnedRef.current = true;
    showSnackbar({
      message: intl.formatMessage({ ...messages.saveError }),
      severity: "warning",
    });
  }, [dispatch, intl, showSnackbar]);

  // Restauració: només en arrencar, i només si no hi ha res a la pantalla.
  // Si mentre es llegia l'esborrany l'usuari ja ha carregat un document o ha
  // posat un pictograma, mana el que està veient.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const draft = await readDraft();
      if (cancelled || !draft || isPristineDocument(draft.document)) return;
      if (!isPristineDocument(documentRef.current)) return;

      dispatch(loadDocumentSaacActionCreator(draft.document));
      // El moment de l'últim canvi no es coneix: el que se sap és quan es va
      // escriure l'esborrany, i és el que l'usuari va veure com a «desat»
      dispatch(
        documentStatusRestoredActionCreator({
          changedAt: draft.savedAt,
          draftSavedAt: draft.savedAt,
          durableAt: draft.durableAt ?? null,
          durableKind: draft.durableKind ?? null,
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // Desat amb debounce a cada canvi del document
  useEffect(() => {
    if (isPristineDocument(document)) return;

    const timer = window.setTimeout(() => {
      void persist();
    }, DRAFT_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [document, persist]);

  // En amagar la pestanya es desa sense esperar el debounce. `visibilitychange`
  // i no només `beforeunload` perquè a iOS el sistema pot matar una pestanya en
  // segon pla sense disparar-lo mai, i l'iPad és el dispositiu típic aquí.
  useEffect(() => {
    const flush = () => {
      if (window.document.visibilityState === "visible") return;
      void persist();
    };

    window.document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);

    return () => {
      window.document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [persist]);
};
