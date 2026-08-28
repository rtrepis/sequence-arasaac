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
  /**
   * L'intent de restaurar l'esborrany ja ha acabat, hi hagués esborrany o no.
   * Ho mira la pàgina de vista abans de muntar-se: els seus hooks copien el
   * format de pàgina a un estat local en muntar-se i ja no el tornen a mirar,
   * de manera que muntar-los abans de la restauració vol dir quedar-se amb el
   * format d'abans encara que arribi el bo un instant després.
   */
  draftRestoreSettled: boolean;
}

const initialState: DocumentStatusState = {
  changedAt: null,
  draftSavedAt: null,
  hasDraftError: false,
  durableAt: null,
  durableKind: null,
  draftRestoreSettled: false,
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

    /** L'arrencada ja ha mirat si hi havia esborrany. */
    draftRestoreSettled: (state) => {
      state.draftRestoreSettled = true;
    },

    /**
     * Document nou: no hi ha res desat ni res pendent. `draftRestoreSettled` no
     * hi entra: no diu res del document, sinó que l'arrencada ja ha passat, i
     * tornar-lo a fals deixaria la pàgina de vista esperant una restauració que
     * no ha de tornar a passar mai.
     */
    documentStatusCleared: (state) => ({
      ...initialState,
      draftRestoreSettled: state.draftRestoreSettled,
    }),
  },
});

export const documentStatusReducer = documentStatusSlice.reducer;

export const {
  documentChanged: documentChangedActionCreator,
  draftSaved: draftSavedActionCreator,
  draftSaveFailed: draftSaveFailedActionCreator,
  documentMadeDurable: documentMadeDurableActionCreator,
  documentStatusRestored: documentStatusRestoredActionCreator,
  draftRestoreSettled: draftRestoreSettledActionCreator,
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
