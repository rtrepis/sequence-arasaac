// Estat de la interfície de l'estil: l'avís que surt en obrir una seqüència, el
// desfer de l'últim canvi d'estil, el diàleg «Canvia l'estil» i el fitxer
// d'estil pendent de decidir què se'n fa.
//
// Viu a Redux i no en un component perquè el fan servir llocs que no comparteixen
// pare: el menú lateral (obrir un fitxer), la pàgina de vista, el panell de
// configuració i l'avís mateix, que va al layout.
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

export type StyleNotice =
  /**
   * S'acaba d'obrir una seqüència. `ownStyle`: té un estil diferent de l'estil
   * per defecte de qui l'obre. `unavailableFonts`: fonts que demana i aquest
   * dispositiu no té.
   */
  (
    | { kind: "opened"; ownStyle: boolean; unavailableFonts: string[] }
    /**
     * S'acaba de canviar l'estil de la seqüència oberta. Amb `fileStyle`, l'estil
     * venia d'un fitxer i es pot desar com a estil per defecte.
     */
    | { kind: "changed"; source: StyleChangeSource; fileStyle?: SequenceStyle }
  ) & {
    /**
     * Document a què es refereix l'avís: si se n'obre o se'n comença un altre,
     * l'avís ja no hi té res a dir i deixa de mostrar-se.
     */
    documentId: string;
  };

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

export interface StyleUiState {
  notice: StyleNotice | null;
  undo: StyleUndo | null;
  changeStyleOpen: boolean;
  /** Fitxer d'estil obert sense cap seqüència: es pregunta si es vol per defecte */
  pendingDefaultStyle: SequenceStyle | null;
}

const initialState: StyleUiState = {
  notice: null,
  undo: null,
  changeStyleOpen: false,
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
    // La comprovació de fonts és asíncrona i arriba després de l'avís
    styleNoticeFontsChecked: (
      state,
      action: PayloadAction<{ documentId: string; unavailableFonts: string[] }>,
    ) => {
      const { notice } = state;
      if (
        notice?.kind === "opened" &&
        notice.documentId === action.payload.documentId
      )
        notice.unavailableFonts = action.payload.unavailableFonts;
    },
    styleUndoRecorded: (state, action: PayloadAction<StyleUndo | null>) => {
      state.undo = action.payload;
    },
    changeStyleOpened: (state) => {
      state.changeStyleOpen = true;
    },
    changeStyleClosed: (state) => {
      state.changeStyleOpen = false;
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
  changeStyleOpened: changeStyleOpenedActionCreator,
  changeStyleClosed: changeStyleClosedActionCreator,
  pendingDefaultStyleSet: pendingDefaultStyleSetActionCreator,
} = styleSlice.actions;

const sameSnapshot = (
  a: DocumentStyleSnapshot,
  b: DocumentStyleSnapshot,
): boolean =>
  a.content === b.content &&
  a.viewSettings === b.viewSettings &&
  a.defaultSettings === b.defaultSettings &&
  a.styleView === b.styleView;

/**
 * Canvia l'estil de la seqüència oberta amb la regla dels retocs, i deixa el
 * canvi a punt de desfer. No toca cap fitxer: el document queda amb canvis
 * sense desar, com qualsevol altra edició.
 */
export const changeDocumentStyleThunk =
  (
    style: SequenceStyle,
    source: StyleChangeSource,
    fileStyle?: SequenceStyle,
  ): AppThunk =>
  (dispatch, getState) => {
    const from = selectDocumentStyle(getState());
    const before = takeDocumentStyleSnapshot(getState().document);

    dispatch(applyDocumentStyleActionCreator({ from, to: style }));

    const after = takeDocumentStyleSnapshot(getState().document);
    dispatch(styleUndoRecordedActionCreator({ before, after }));
    dispatch(
      styleNoticeShownActionCreator({
        kind: "changed",
        source,
        fileStyle,
        documentId: getState().document.id,
      }),
    );
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
  dispatch(styleNoticeClosedActionCreator());
};

/** L'estil de la seqüència oberta és diferent de l'estil per defecte? */
export const selectDocumentHasOwnStyle = (
  state: Parameters<typeof selectDocumentStyle>[0],
): boolean =>
  !stylesEqual(selectDocumentStyle(state), selectUserDefaultStyle(state));
