// Slice Redux per a l'estat d'autenticació de l'usuari.
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setAccessToken } from "../../api/apiClient";
import * as authService from "../services/authService";
import { getSettings } from "../../user-settings/services/settingsService";
import {
  updateDefaultSettingsActionCreator,
  updateLangSettingsActionCreator,
} from "@features/user-settings/store/uiSlice";
import {
  saveSettings,
  saveLangSettings,
} from "@features/user-settings/storage/settingsStorage";

export interface AuthState {
  accessToken: string | null;
  userEmail: string | null;
  isLoading: boolean;
  errorCode: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  userEmail: null,
  isLoading: false,
  errorCode: null,
};

// Sincronitza les settings del backend amb el store local + storage
const syncSettingsAfterAuth = async (
  dispatch: (action: unknown) => void,
): Promise<void> => {
  try {
    const { settings, langSettings } = await getSettings();
    dispatch(updateDefaultSettingsActionCreator(settings));
    saveSettings(settings);
    dispatch(
      updateLangSettingsActionCreator({
        app: langSettings.app,
        search: langSettings.search,
        keywords: [],
      }),
    );
    saveLangSettings(langSettings);
  } catch {
    // Si falla la sincronització no interrompem el flux d'auth
  }
};

// Thunk: login
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { accessToken } = await authService.login(email, password);
      setAccessToken(accessToken);
      await syncSettingsAfterAuth(dispatch);
      return { accessToken, email };
    } catch (error: unknown) {
      const errorCode =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "AUTH_ERROR";
      return rejectWithValue(errorCode);
    }
  },
);

// Thunk: register
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    { email, password }: { email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { accessToken } = await authService.register(email, password);
      setAccessToken(accessToken);
      await syncSettingsAfterAuth(dispatch);
      return { accessToken, email };
    } catch (error: unknown) {
      const errorCode =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "REGISTER_ERROR";
      return rejectWithValue(errorCode);
    }
  },
);

// Thunk: logout
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch {
      // Ignorar errors de logout al servidor; netegem l'estat local igualment
    }
    setAccessToken(null);
  },
);

// Thunk: refresh silent (cridat a AppBootstrap per restaurar la sessió)
export const refreshSessionThunk = createAsyncThunk(
  "auth/refreshSession",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken } = await authService.refreshToken();
      setAccessToken(accessToken);
      // Intentar obtenir l'email del payload del token (base64 decode)
      const payload = JSON.parse(atob(accessToken.split(".")[1])) as {
        userId: string;
      };
      await syncSettingsAfterAuth(dispatch);
      return { accessToken, userId: payload.userId };
    } catch {
      setAccessToken(null);
      return rejectWithValue("Sessió caducada");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reducer síncron per situacions on cal netejar l'estat manualment
    clearAuthState: (state) => {
      state.accessToken = null;
      state.userEmail = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.errorCode = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<{ accessToken: string; email: string }>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.userEmail = action.payload.email;
        },
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.errorCode = action.payload as string;
      });

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.errorCode = null;
      })
      .addCase(
        registerThunk.fulfilled,
        (state, action: PayloadAction<{ accessToken: string; email: string }>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.userEmail = action.payload.email;
        },
      )
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.errorCode = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.accessToken = null;
        state.userEmail = null;
        state.errorCode = null;
      });

    // Refresh silent
    builder
      .addCase(refreshSessionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        refreshSessionThunk.fulfilled,
        (state, action: PayloadAction<{ accessToken: string; userId: string }>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          // L'email no el tenim del refresh token (només userId), el deixem null
          // fins que l'usuari faci alguna acció autenticada
        },
      )
      .addCase(refreshSessionThunk.rejected, (state) => {
        state.isLoading = false;
        state.accessToken = null;
        state.userEmail = null;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export const authReducer = authSlice.reducer;
