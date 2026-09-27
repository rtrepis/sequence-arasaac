// Obre un fitxer `.saac` o `.saacstyle` i decideix què se'n fa, segons el que
// porta i per què s'ha obert (`docs/fonaments/sequencia-i-estil.md`, punt 3):
//
// | Fitxer    | Des de «Carrega»                           | Des de «Carrega un estil…»   |
// |-----------|--------------------------------------------|------------------------------|
// | Seqüència | s'obre tal com es va desar                 | se n'aplica només l'estil    |
// | Estil     | s'aplica a la seqüència oberta (amb desfer) | s'aplica (amb desfer)        |
// |           | o, si no n'hi ha, es proposa per defecte    |                              |
//
// La interpretació del fitxer (formats antics, estil parcial) és a `saacFile.ts`.
import { useCallback } from "react";
import { useStore } from "react-redux";
import { useIntl } from "react-intl";
import type { RootState } from "@/app/store";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { loadDocumentSaacActionCreator } from "@features/sequence/store/documentSlice";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import {
  changeDocumentStyleThunk,
  pendingDefaultStyleSetActionCreator,
  selectDocumentHasOwnStyle,
  styleNoticeClosedActionCreator,
  styleNoticeFontsCheckedActionCreator,
  styleNoticeShownActionCreator,
  styleUndoRecordedActionCreator,
} from "@features/sequence/store/styleSlice";
import {
  ParsedSaacFile,
  parseSaacFile,
} from "@features/sequence/style/saacFile";
import {
  fontFamiliesUsed,
  resolveDocumentStyle,
} from "@features/sequence/style/styleModel";
import {
  selectDocumentStyle,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import { findUnavailableFonts } from "@features/sequence/style/fontAvailability";
import { isPristineDocument } from "@features/sequence/utils/isPristineDocument";

/** Per què s'obre el fitxer: com a document, o només per treure'n l'estil. */
export type OpenFileIntent = "open" | "style";

const newDocumentId = (): string =>
  `${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;

const readText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export const useOpenSaacFile = () => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const intl = useIntl();
  const { showBackdrop, hideBackdrop, showSnackbar } = useFeedback();

  /**
   * Avís d'estil de la seqüència que s'acaba d'obrir (fitxer o núvol): si té
   * un estil diferent de l'estil per defecte, i quines fonts no hi ha.
   */
  const announceOpenedDocument = useCallback(() => {
    const document = store.getState().document;
    // El desfer d'un canvi d'estil era del document d'abans
    dispatch(styleUndoRecordedActionCreator(null));
    dispatch(styleNoticeClosedActionCreator());

    const ownStyle = selectDocumentHasOwnStyle(store.getState());
    if (ownStyle)
      dispatch(
        styleNoticeShownActionCreator({
          kind: "opened",
          documentId: document.id,
          ownStyle,
          unavailableFonts: [],
        }),
      );

    // Les fonts es comproven després: carregar-les pot trigar, i l'avís ja es
    // pot llegir mentrestant
    const families = fontFamiliesUsed(
      document,
      selectDocumentStyle(store.getState()),
    );
    void findUnavailableFonts(families).then((unavailableFonts) => {
      if (unavailableFonts.length === 0) return;
      if (store.getState().document.id !== document.id) return;

      if (ownStyle)
        dispatch(
          styleNoticeFontsCheckedActionCreator({
            documentId: document.id,
            unavailableFonts,
          }),
        );
      else
        dispatch(
          styleNoticeShownActionCreator({
            kind: "opened",
            documentId: document.id,
            ownStyle: false,
            unavailableFonts,
          }),
        );
    });
  }, [dispatch, store]);

  const openSequence = useCallback(
    (parsed: Extract<ParsedSaacFile, { kind: "sequence" }>) => {
      dispatch(loadDocumentSaacActionCreator(parsed.document));
      // El que s'acaba de carregar existeix en un fitxer del disc: és l'únic
      // cas en què obrir també vol dir «això ja està desat»
      dispatch(documentMadeDurableActionCreator({ kind: "file" }));

      showSnackbar({
        message: intl.formatMessage(feedbackMessages.loadSuccess),
        severity: "success",
      });

      announceOpenedDocument();
    },
    [announceOpenedDocument, dispatch, intl, showSnackbar],
  );

  const openFile = useCallback(
    async (file: File, intent: OpenFileIntent): Promise<void> => {
      showBackdrop({ message: intl.formatMessage(feedbackMessages.loading) });

      let parsed: ParsedSaacFile;
      try {
        parsed = parseSaacFile(JSON.parse(await readText(file)), {
          userDefault: selectUserDefaultStyle(store.getState()),
          newId: newDocumentId,
        });
      } catch (error) {
        console.error(error);
        parsed = { kind: "invalid" };
      }
      hideBackdrop();

      trackEvent({
        event: "load-event",
        event_category: "file",
        event_label: intent === "open" ? "load" : "load-style",
        value: parsed.kind,
      });

      if (parsed.kind === "invalid") {
        showSnackbar({
          message: intl.formatMessage(feedbackMessages.loadError),
          severity: "error",
        });
        return;
      }

      if (parsed.kind === "sequence" && intent === "open") {
        openSequence(parsed);
        return;
      }

      // D'aquí avall, del fitxer només interessa l'estil
      const style =
        parsed.kind === "style"
          ? parsed.style
          : resolveDocumentStyle(
              parsed.document,
              selectUserDefaultStyle(store.getState()),
            );

      // Un fitxer d'estil obert sense cap seqüència no té on aplicar-se: es
      // pregunta si es vol fer servir per defecte
      if (intent === "open" && isPristineDocument(store.getState().document)) {
        dispatch(pendingDefaultStyleSetActionCreator(style));
        return;
      }

      // L'avís del canvi, amb «Desfés», és el missatge d'aquesta acció
      dispatch(changeDocumentStyleThunk(style, "file", style));
    },
    [
      dispatch,
      hideBackdrop,
      intl,
      openSequence,
      showBackdrop,
      showSnackbar,
      store,
    ],
  );

  return { openFile, announceOpenedDocument };
};
