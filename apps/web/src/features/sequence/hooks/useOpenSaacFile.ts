// Obre un fitxer `.saac` o `.saacstyle` i decideix què se'n fa, segons el que
// porta i per què s'ha obert (`docs/fonaments/sequencia-i-estil.md`, punt 3):
//
// | Fitxer    | Des de «Carrega»                           | Des de «Carrega un estil…»   |
// |-----------|--------------------------------------------|------------------------------|
// | Document  | s'obre tal com es va desar                 | se n'aplica només l'estil    |
// | Estil     | es pregunta: aplicar-lo, fer-lo per defecte | s'aplica (amb desfer)        |
// |           | o cancel·lar                                |                              |
//
// La interpretació del fitxer (format v3, formats antics, estil parcial) és a
// `features/sequence/saac/parse.ts`: el tipus es decideix pel contingut, mai
// per l'extensió (`docs/fonaments/06-compatibilitat-i-dades.md`, §6).
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
  OpenNotices,
  ParsedSaac,
  parseSaac,
} from "@features/sequence/saac/parse";
import { parseContextOf } from "@features/sequence/saac/saacContext";
import {
  fontFamiliesUsed,
  resolveDocumentStyle,
} from "@features/sequence/style/styleModel";
import {
  selectDocumentStyle,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import { findUnavailableFonts } from "@features/sequence/style/fontAvailability";

/** Per què s'obre el fitxer: com a document, o només per treure'n l'estil. */
export type OpenFileIntent = "open" | "style";

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
   * Bàner del document que s'acaba d'obrir (fitxer o núvol): si té un estil
   * diferent de l'estil per defecte, quines fonts no hi ha i, d'un fitxer, si
   * era d'una altra versió de l'app.
   */
  const announceOpenedDocument = useCallback(
    (notices?: OpenNotices) => {
      const document = store.getState().document;
      // El desfer d'un canvi d'estil era del document d'abans
      dispatch(styleUndoRecordedActionCreator(null));
      dispatch(styleNoticeClosedActionCreator());

      const ownStyle = selectDocumentHasOwnStyle(store.getState());
      const versionNotices = {
        legacy: notices?.legacy ?? false,
        withoutStyle: (notices?.legacy ?? false) && notices?.withoutStyle,
        newerVersion: notices?.newerVersion ?? false,
      };
      const hasNotice =
        ownStyle || versionNotices.legacy || versionNotices.newerVersion;
      if (hasNotice)
        dispatch(
          styleNoticeShownActionCreator({
            documentId: document.id,
            ownStyle,
            unavailableFonts: [],
            ...versionNotices,
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

        if (hasNotice)
          dispatch(
            styleNoticeFontsCheckedActionCreator({
              documentId: document.id,
              unavailableFonts,
            }),
          );
        else
          dispatch(
            styleNoticeShownActionCreator({
              documentId: document.id,
              ownStyle: false,
              unavailableFonts,
            }),
          );
      });
    },
    [dispatch, store],
  );

  const openSequence = useCallback(
    (parsed: Extract<ParsedSaac, { kind: "document" }>) => {
      dispatch(loadDocumentSaacActionCreator(parsed.document));
      // El que s'acaba de carregar existeix en un fitxer del disc: és l'únic
      // cas en què obrir també vol dir «això ja està desat»
      dispatch(documentMadeDurableActionCreator({ kind: "file" }));

      showSnackbar({
        message: intl.formatMessage(feedbackMessages.loadSuccess),
        severity: "success",
      });

      announceOpenedDocument(parsed.notices);
    },
    [announceOpenedDocument, dispatch, intl, showSnackbar],
  );

  const openFile = useCallback(
    async (file: File, intent: OpenFileIntent): Promise<void> => {
      showBackdrop({ message: intl.formatMessage(feedbackMessages.loading) });

      let parsed: ParsedSaac;
      try {
        // Obrir no toca les preferències: només les fa servir per omplir el
        // que el fitxer no porta
        parsed = parseSaac(
          await readText(file),
          parseContextOf(store.getState()),
        );
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
          message: intl.formatMessage(feedbackMessages.loadInvalidFile),
          severity: "error",
        });
        return;
      }

      if (parsed.kind === "document" && intent === "open") {
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

      // Un fitxer d'estil obert com a document: es pregunta què se'n fa
      // (aplicar-lo, fer-lo l'estil per defecte o res)
      if (intent === "open") {
        dispatch(pendingDefaultStyleSetActionCreator(style));
        return;
      }

      // L'avís del canvi, amb «Desfés», és el missatge d'aquesta acció
      dispatch(changeDocumentStyleThunk(style, "file"));
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
