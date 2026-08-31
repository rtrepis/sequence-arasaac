// Consum i límits del compte: quant espai, quants documents i quantes paraules
// li queden a l'usuari.
//
// Viu fora d'`uiSlice` a propòsit: no és cap preferència ni res que l'usuari
// pugui canviar, és el que diu el servidor de com està el compte. Si hi fos,
// desar la configuració l'enviaria de tornada com si fos una tria.
//
// Es pot quedar a `null`, i null no vol dir zero: vol dir «encara no ho sabem»
// —sense sessió, o amb el servidor de Render adormit—. Amb aquesta diferència
// esborrada, un compte buit i un compte desconegut serien la mateixa cosa i
// l'avís de «no hi cap» sortiria a qui treballa sense compte.
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  QuotaLimits,
  UserQuotaStatus,
  UserUsage,
} from "@sequence-arasaac/shared-types";
import { getQuotaStatus } from "../services/settingsService";

export interface QuotaState {
  usage: UserUsage | null;
  limits: QuotaLimits | null;
  /** Pes màxim d'una imatge, tal com el fa complir el servidor. */
  maxImageBytes: number | null;
}

const initialState: QuotaState = {
  usage: null,
  limits: null,
  maxImageBytes: null,
};

// Refresca el consum després d'una operació que l'ha canviat (desar un document,
// esborrar-lo, desar el vocabulari o treure una imatge).
//
// No es reintenta ni s'informa de res si falla: el consum és informatiu i el
// límit de veritat el fa complir el servidor a la petició següent. Un error
// aquí no ha d'interrompre res del que l'usuari estava fent.
export const refreshQuotaThunk = createAsyncThunk(
  "quota/refresh",
  async (_, { rejectWithValue }) => {
    try {
      return await getQuotaStatus();
    } catch {
      return rejectWithValue(null);
    }
  },
);

const quotaSlice = createSlice({
  name: "quota",
  initialState,
  reducers: {
    // El consum arriba amb la configuració a cada restauració de sessió: allà
    // no costa cap petició, i és el moment en què se sap del cert.
    setQuota: (state, action: PayloadAction<Partial<UserQuotaStatus>>) => {
      const { usage, limits, maxImageBytes } = action.payload;
      if (usage) state.usage = usage;
      if (limits) state.limits = limits;
      if (maxImageBytes !== undefined) state.maxImageBytes = maxImageBytes;
    },

    // En tancar sessió: el consum és del compte, no del dispositiu
    clearQuota: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(refreshQuotaThunk.fulfilled, (state, action) => {
      state.usage = action.payload.usage;
      state.limits = action.payload.limits;
      state.maxImageBytes = action.payload.maxImageBytes;
    });
  },
});

export const quotaReducer = quotaSlice.reducer;

export const {
  setQuota: setQuotaActionCreator,
  clearQuota: clearQuotaActionCreator,
} = quotaSlice.actions;
