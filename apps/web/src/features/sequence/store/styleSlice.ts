// Estat de la interfície de l'estil del document: el bàner que surt en obrir un
// document, el snackbar amb «Desfés» de l'últim canvi d'estil, la petició
// d'obrir el panell «Estil del document» i el fitxer d'estil pendent de decidir
// què se'n fa.
//
// Viu a Redux i no en un component perquè el fan servir llocs que no comparteixen
// pare: el menú lateral (obrir un fitxer), la pàgina de vista, el panell de
// configuració i el bàner mateix, que va al layout.
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SequenceStyle } from "@/types/document";
import {
  applyDocumentStyleActionCreator,
  DocumentStyleSnapshot,
  restoreDocumentStyleActionCreator,
  takeDocumentStyleSnapshot,
} from "./documentSlice";
import type { AppThunk } from "@/app/store";
import {
  selectDocumentStyle,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import { stylesEqual } from "@features/sequence/style/styleModel";

/** D'on ve l'estil que s'acaba d'aplicar. */
export type StyleChangeSource = "userDefault" | "file";

/**
 * Bàner d'estat del document que s'acaba d'obrir: és estat, no confirmació, i
 * per això és un bàner i no un snackbar (`docs/estandards/feedback-i-accions.md`).
 */
export interface StyleNotice {
  /** Té un estil diferent de l'estil per defecte de qui l'obre */
  ownStyle: boolean;
  /** És d'una versió anterior i s'ha adaptat al format v3 */
  legacy?: boolean;
  /** No portava estil propi (o sencer): hi va el de qui l'obre */
  withoutStyle?: boolean;
  /** És d'una versió més nova de l'app */
  newerVersion?: boolean;
  /** Fonts que demana i aquest dispositiu no té */
  unavailableFonts: string[];
  /**
   * Document a què es refereix: si se n'obre o se'n comença un altre, el bàner
   * ja no hi té res a dir i deixa de mostrar-se.
   */
  documentId: string;
}

interface StyleUndo {
  /** Com era el document abans del canvi */
  before: DocumentStyleSnapshot;
  /**
   * Com ha quedat just després. Són les mateixes referències que hi ha a
   * l'store: mentre coincideixin, ningú no ha tocat el document des del canvi i
   * desfer-lo no s'endú cap altra feina.
   */
  after: DocumentStyleSnapshot;
}

/** Confirmació del canvi d'estil que s'acaba de fer, amb «Desfés». */
export interface StyleUndoSnackbar {
  source: StyleChangeSource;
  /** Cada canvi n'obre un de nou, encara que el text sigui el mateix */
  id: number;
}

export interface StyleUiState {
  notice: StyleNotice | null;
  undo: StyleUndo | null;
  undoSnackbar: StyleUndoSnackbar | null;
  /** Algú (el bàner) ha demanat obrir el panell «Estil del document» */
  stylePanelRequested: boolean;
  /**
   * El diàleg de configuració és obert. Mentre ho és, el snackbar de desfer
   * es pinta a dins del panell i no al layout: el diàleg atrapa el focus, i un
   * snackbar de fora no s'hi podria fer servir amb el teclat.
   */
  settingsDialogOpen: boolean;
  /** Fitxer d'estil obert sense cap document: es pregunta si es vol per defecte */
  pendingDefaultStyle: SequenceStyle | null;
}

const initialState: StyleUiState = {
  notice: null,
  undo: null,
  undoSnackbar: null,
  stylePanelRequested: false,
  settingsDialogOpen: false,
  pendingDefaultStyle: null,
};

const styleSlice = createSlice({
  name: "style",
  initialState,
  reducers: {
    styleNoticeShown: (state, action: PayloadAction<StyleNotice>) => {
      state.notice = action.payload;
    },
    styleNoticeClosed: (state) => {
      state.notice = null;
    },
    // La comprovació de fonts és asíncrona i arriba després del bàner
    styleNoticeFontsChecked: (
      state,
      action: PayloadAction<{ documentId: string; unavailableFonts: string[] }>,
    ) => {
      const { notice } = state;
      if (notice?.documentId === action.payload.documentId)
        notice.unavailableFonts = action.payload.unavailableFonts;
    },
    styleUndoRecorded: (state, action: PayloadAction<StyleUndo | null>) => {
      state.undo = action.payload;
    },
    styleUndoSnackbarShown: (
      state,
      action: PayloadAction<StyleChangeSource>,
    ) => {
      state.undoSnackbar = {
        source: action.payload,
        id: (state.undoSnackbar?.id ?? 0) + 1,
      };
    },
    styleUndoSnackbarClosed: (state) => {
      state.undoSnackbar = null;
    },
    stylePanelRequested: (state) => {
      state.stylePanelRequested = true;
    },
    stylePanelRequestHandled: (state) => {
      state.stylePanelRequested = false;
    },
    settingsDialogOpenChanged: (state, action: PayloadAction<boolean>) => {
      state.settingsDialogOpen = action.payload;
    },
    pendingDefaultStyleSet: (
      state,
      action: PayloadAction<SequenceStyle | null>,
    ) => {
      state.pendingDefaultStyle = action.payload;
    },
  },
});

export const styleReducer = styleSlice.reducer;

export const {
  styleNoticeShown: styleNoticeShownActionCreator,
  styleNoticeClosed: styleNoticeClosedActionCreator,
  styleNoticeFontsChecked: styleNoticeFontsCheckedActionCreator,
  styleUndoRecorded: styleUndoRecordedActionCreator,
  styleUndoSnackbarShown: styleUndoSnackbarShownActionCreator,
  styleUndoSnackbarClosed: styleUndoSnackbarClosedActionCreator,
  stylePanelRequested: stylePanelRequestedActionCreator,
  stylePanelRequestHandled: stylePanelRequestHandledActionCreator,
  settingsDialogOpenChanged: settingsDialogOpenChangedActionCreator,
  pendingDefaultStyleSet: pendingDefaultStyleSetActionCreator,
} = styleSlice.actions;

const sameSnapshot = (
  a: DocumentStyleSnapshot,
  b: DocumentStyleSnapshot,
): boolean =>
  a.content === b.content &&
  a.viewSettings === b.viewSettings &&
  a.defaultSettings === b.defaultSettings &&
  a.styleView === b.styleView &&
  a.fitzgeraldColors === b.fitzgeraldColors;

/**
 * Aplica un estil al document obert amb la regla dels retocs, i deixa el canvi
 * a punt de desfer amb un snackbar. No toca cap fitxer: el document queda amb
 * canvis sense desar, com qualsevol altra edició.
 */
export const changeDocumentStyleThunk =
  (style: SequenceStyle, source: StyleChangeSource): AppThunk =>
  (dispatch, getState) => {
    const from = selectDocumentStyle(getState());
    const before = takeDocumentStyleSnapshot(getState().document);

    dispatch(applyDocumentStyleActionCreator({ from, to: style }));

    const after = takeDocumentStyleSnapshot(getState().document);
    dispatch(styleUndoRecordedActionCreator({ before, after }));
    dispatch(styleUndoSnackbarShownActionCreator(source));
  };

/** Si el document no s'ha tocat des del canvi d'estil, es pot desfer. */
export const selectCanUndoStyle = (state: {
  style: StyleUiState;
  document: Parameters<typeof takeDocumentStyleSnapshot>[0];
}): boolean =>
  state.style.undo !== null &&
  sameSnapshot(
    state.style.undo.after,
    takeDocumentStyleSnapshot(state.document),
  );

export const undoStyleChangeThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  if (!selectCanUndoStyle(state) || state.style.undo === null) return;

  dispatch(restoreDocumentStyleActionCreator(state.style.undo.before));
  dispatch(styleUndoRecordedActionCreator(null));
  dispatch(styleUndoSnackbarClosedActionCreator());
};

/** L'estil del document obert és diferent de l'estil per defecte? */
export const selectDocumentHasOwnStyle = (
  state: Parameters<typeof selectDocumentStyle>[0],
): boolean =>
  !stylesEqual(selectDocumentStyle(state), selectUserDefaultStyle(state));
