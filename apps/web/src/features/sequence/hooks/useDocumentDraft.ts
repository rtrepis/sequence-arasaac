// Autodesat de l'esborrany del document al navegador.
//
// La configuració ja sobreviu sola a un refresc (settingsStorage), i això crea
// l'expectativa raonable que la seqüència també ho faci. No era així: fins ara
// només es conservava prement «Descarrega» o «Desa al núvol», i un refresc
// accidental s'enduia la feina sense cap avís.
import { useCallback, useEffect, useRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";
import { loadDocumentSaacActionCreator } from "@features/sequence/store/documentSlice";
import { readDraft, saveDraft } from "@features/sequence/storage/draftStorage";
import { requestPersistentStorage } from "@features/sequence/storage/persistentStorage";
import {
  documentStatusRestoredActionCreator,
  draftBlockedByOtherTabActionCreator,
  draftRestoreSettledActionCreator,
  draftSavedActionCreator,
  draftSaveFailedActionCreator,
} from "@features/sequence/store/documentStatusSlice";
import { sessionViewSettingsRestoredActionCreator } from "@features/user-settings/store/uiSlice";
import { sanitizeViewSettings } from "@/configs/viewSettingsConfig";
import { useFeedback } from "@/context/FeedbackContext";
import { DocumentSAAC } from "@/types/document";
import { ViewSettings } from "@/types/ui";
import messages from "../components/DocumentDraftSync.lang";

// Prou curt perquè no es perdi res en tancar de cop, prou llarg perquè
// arrossegar un slider no dispari una escriptura per moviment
const DRAFT_SAVE_DELAY_MS = 1000;

const selectDocument = (state: RootState): DocumentSAAC => state.document;

// Es tria l'objecte sencer i no un de nou amb els dos camps: un objecte
// construït al selector és una referència nova a cada acció de l'app i faria
// re-renderitzar per res
const selectStatus = (state: RootState) => state.documentStatus;

// El format de pàgina i els ajustos globals de la vista. És estat de sessió —el
// mirall que manté la pàgina de vista—, no una preferència desada, i per això
// va a l'esborrany i no al compte.
const selectViewSettings = (state: RootState): ViewSettings =>
  state.ui.viewSettings;

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

  const viewSettings = useAppSelector(selectViewSettings);
  const viewSettingsRef = useRef(viewSettings);
  viewSettingsRef.current = viewSettings;

  // L'última parella que s'ha arribat a escriure. El flush de `visibilitychange`
  // salta cada cop que s'amaga la pestanya, i sense això reescriuria el mateix
  // esborrany una vegada i una altra sense que hagi canviat res. Hi ha de ser
  // la parella i no només el document: girar el full no toca el document, i
  // comparant-ne només aquest la comprovació donava «res a fer» i el format nou
  // no s'arribava a escriure mai.
  const persistedRef = useRef<{
    document: DocumentSAAC;
    viewSettings: ViewSettings;
  } | null>(null);

  // El `savedAt` de l'últim registre que aquesta pestanya coneix: el que ha
  // llegit en arrencar o el que ha escrit ella mateixa. Si al disc n'hi ha un de
  // més nou, és d'una altra pestanya i no es pot trepitjar.
  const lastSeenSavedAtRef = useRef<number | null>(null);

  // L'avís de «no s'ha pogut desar» surt un sol cop: si l'espai s'ha acabat —o
  // si l'altra pestanya continua treballant—, cada canvi posterior tornaria a
  // fallar i el convertiria en soroll
  const hasWarnedRef = useRef(false);

  const warnOnce = useCallback(
    (message: MessageDescriptor) => {
      if (hasWarnedRef.current) return;

      hasWarnedRef.current = true;
      showSnackbar({
        message: intl.formatMessage(message),
        severity: "warning",
      });
    },
    [intl, showSnackbar],
  );

  const persist = useCallback(async () => {
    const current = documentRef.current;
    const currentView = viewSettingsRef.current;
    if (isPristineDocument(current)) return;

    const persisted = persistedRef.current;
    if (
      persisted !== null &&
      persisted.document === current &&
      persisted.viewSettings === currentView
    )
      return;

    const savedAt = Date.now();
    // `changedAt` viatja tal com és: si es posés `savedAt` al seu lloc en
    // restaurar, sempre semblaria que hi ha hagut un canvi després de l'últim
    // desat. Un canvi de format **no** el toca —no és contingut del document i
    // no viatja ni al `.saac` ni al núvol—, així que girar el full no converteix
    // un document desat al núvol en feina sense desar.
    const { changedAt, durableAt, durableKind } = statusRef.current;
    const result = await saveDraft(
      current,
      { savedAt, changedAt, durableAt, durableKind },
      currentView,
      lastSeenSavedAtRef.current,
    );

    if (result === "saved") {
      persistedRef.current = { document: current, viewSettings: currentView };
      lastSeenSavedAtRef.current = savedAt;
      dispatch(draftSavedActionCreator(savedAt));
      // Ara que hi ha alguna cosa a protegir, es demana al navegador que no la
      // desallotgi. A Chrome es resol en silenci; a Firefox caldrà el gest de
      // l'usuari que fa el botó d'estat
      void requestPersistentStorage();
      return;
    }

    if (result === "conflict") {
      dispatch(draftBlockedByOtherTabActionCreator());
      warnOnce(messages.conflictError);
      return;
    }

    dispatch(draftSaveFailedActionCreator());
    warnOnce(messages.saveError);
  }, [dispatch, warnOnce]);

  // Restauració: només en arrencar, i només si no hi ha res a la pantalla.
  // Si mentre es llegia l'esborrany l'usuari ja ha carregat un document o ha
  // posat un pictograma, mana el que està veient.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const draft = await readDraft();
      if (cancelled) return;

      // S'ha vist encara que no se'n faci cas: el que compta per no trepitjar
      // una altra pestanya és quin registre coneix aquesta, no si l'ha restaurat
      if (draft !== null) lastSeenSavedAtRef.current = draft.savedAt;

      if (
        draft !== null &&
        !isPristineDocument(draft.document) &&
        isPristineDocument(documentRef.current)
      ) {
        dispatch(loadDocumentSaacActionCreator(draft.document));
        dispatch(
          documentStatusRestoredActionCreator({
            // Els esborranys escrits abans que hi hagués el camp no en porten:
            // amb `durableAt` el cas durador continua dient la veritat, i sense
            // còpia fora `savedAt` deixa el comportament que ja tenien
            changedAt: draft.changedAt ?? draft.durableAt ?? draft.savedAt,
            draftSavedAt: draft.savedAt,
            durableAt: draft.durableAt ?? null,
            durableKind: draft.durableKind ?? null,
          }),
        );

        const restoredView = draft.viewSettings
          ? sanitizeViewSettings(draft.viewSettings)
          : null;

        // El format de pàgina només es restaura amb el document: aplicar el
        // d'una sessió antiga sobre feina nova seria pitjor que perdre'l
        if (restoredView !== null)
          dispatch(sessionViewSettingsRestoredActionCreator(restoredView));

        // El que s'acaba de llegir ja és el que hi ha escrit: sense marcar-ho,
        // el primer flush el tornaria a escriure tal qual, i amb una altra
        // pestanya pel mig aquella escriptura innecessària és justament la que
        // es carrega la feina bona
        persistedRef.current = {
          document: draft.document,
          viewSettings: restoredView ?? viewSettingsRef.current,
        };
      }

      // Es marca sempre, hi hagi hagut esborrany o no: la pàgina de vista hi
      // espera per no muntar-se amb un format que la restauració canviarà un
      // instant després
      dispatch(draftRestoreSettledActionCreator());
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
    // `viewSettings` hi és perquè el format de pàgina també s'ha de desar: no
    // canvia el document, i sense això només s'escriuria de retruc al següent
    // canvi de contingut
  }, [document, viewSettings, persist]);

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
