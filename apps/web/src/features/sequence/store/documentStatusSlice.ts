// On és, ara mateix, la feina que l'usuari veu a pantalla.
//
// Viu separat de `documentSlice` perquè no és contingut del document: no viatja
// dins del fitxer `.saac` ni al cos que rep l'API. Si hi fos, desar el document
// canviaria el document, i el que volem és exactament el contrari — saber si el
// que hi ha a pantalla ja té còpia enlloc.
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** Còpia que sobreviu fora d'aquest navegador: fitxer baixat o document al núvol. */
export type DurableKind = "file" | "cloud";

export interface DocumentStatusState {
  /** Últim canvi de contingut del document. */
  changedAt: number | null;
  /** Últim esborrany escrit al navegador (IndexedDB). */
  draftSavedAt: number | null;
  /** El navegador no ha pogut desar l'esborrany (espai exhaurit, mode privat…). */
  hasDraftError: boolean;
  /** Últim desat fora del navegador. */
  durableAt: number | null;
  durableKind: DurableKind | null;
}

const initialState: DocumentStatusState = {
  changedAt: null,
  draftSavedAt: null,
  hasDraftError: false,
  durableAt: null,
  durableKind: null,
};

const documentStatusSlice = createSlice({
  name: "documentStatus",
  initialState,
  reducers: {
    /** Ha canviat el contingut. L'emet el middleware, no els components. */
    documentChanged: (state, action: PayloadAction<number | undefined>) => {
      state.changedAt = action.payload ?? Date.now();
    },

    draftSaved: (state, action: PayloadAction<number>) => {
      state.draftSavedAt = action.payload;
      state.hasDraftError = false;
    },

    draftSaveFailed: (state) => {
      state.hasDraftError = true;
    },

    /** El document ja té còpia fora del navegador. */
    documentMadeDurable: (
      state,
      action: PayloadAction<{ kind: DurableKind; at?: number }>,
    ) => {
      state.durableAt = action.payload.at ?? Date.now();
      state.durableKind = action.payload.kind;
      // Desar és també la prova que el navegador funciona: si l'esborrany havia
      // fallat, mantenir l'avís d'error només confondria
      state.hasDraftError = false;
    },

    /** Recupera l'estat desat amb l'esborrany en arrencar. */
    documentStatusRestored: (
      state,
      action: PayloadAction<Partial<DocumentStatusState>>,
    ) => ({ ...state, ...action.payload }),

    /** Document nou: no hi ha res desat ni res pendent. */
    documentStatusCleared: () => initialState,
  },
});

export const documentStatusReducer = documentStatusSlice.reducer;

export const {
  documentChanged: documentChangedActionCreator,
  draftSaved: draftSavedActionCreator,
  draftSaveFailed: draftSaveFailedActionCreator,
  documentMadeDurable: documentMadeDurableActionCreator,
  documentStatusRestored: documentStatusRestoredActionCreator,
  documentStatusCleared: documentStatusClearedActionCreator,
} = documentStatusSlice.actions;

/**
 * Els cinc estats que pot veure l'usuari. `local` i `durable` es diferencien
 * a propòsit: l'esborrany del navegador no és un desat, i dir-ne «desat» a
 * seques és el malentès que aquest indicador ha d'evitar.
 */
export type DocumentDurability =
  | "pristine"
  | "saving"
  | "local"
  | "durable"
  | "error";

export const getDocumentDurability = (
  status: DocumentStatusState,
): DocumentDurability => {
  const { changedAt, draftSavedAt, hasDraftError, durableAt } = status;

  if (hasDraftError) return "error";
  if (changedAt === null && durableAt === null) return "pristine";
  if (changedAt !== null && (draftSavedAt === null || draftSavedAt < changedAt))
    return "saving";
  if (durableAt !== null && (changedAt === null || changedAt <= durableAt))
    return "durable";

  return "local";
};
