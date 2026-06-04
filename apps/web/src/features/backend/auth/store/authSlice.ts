// Slice Redux per a l'estat d'autenticació de l'usuari.
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setAccessToken } from "../../api/apiClient";
import * as authService from "../services/authService";
import { getUiSettings } from "../../user-settings/services/settingsService";
import {
  updateDefaultSettingsActionCreator,
  updateLangSettingsActionCreator,
  updateThemeActionCreator,
  viewSettingsActionCreator,
} from "@features/user-settings/store/uiSlice";
import { getStoredUserUi } from "@features/user-settings/storage/settingsStorage";
import { langTranslateApp } from "../../../../configs/languagesConfigs";
import { LangsApp } from "../../../../types/ui";

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

// Carrega les preferències del backend al Redux (no toca localStorage — és de l'anònim)
const syncSettingsAfterAuth = async (
  dispatch: (action: unknown) => void,
): Promise<void> => {
  try {
    const { lang, theme, defaultSettings, viewSettings } = await getUiSettings();
    dispatch(updateDefaultSettingsActionCreator(defaultSettings));
    dispatch(updateLangSettingsActionCreator({ app: lang.app, search: lang.search, keywords: [] }));
    dispatch(updateThemeActionCreator(theme ?? "system"));
    if (viewSettings) dispatch(viewSettingsActionCreator(viewSettings));
  } catch {
    // Si falla la sincronització no interrompem el flux d'auth
  }
};

// Restaura les preferències anònimes del localStorage al Redux després del logout
const restoreAnonymousSettings = (dispatch: (action: unknown) => void): void => {
  const storedUi = getStoredUserUi();

  if (storedUi) {
    dispatch(updateDefaultSettingsActionCreator(storedUi.defaultSettings));
    dispatch(updateThemeActionCreator(storedUi.theme));
    dispatch(updateLangSettingsActionCreator({ app: storedUi.lang.app, search: storedUi.lang.search, keywords: [] }));
    if (storedUi.viewSettings) dispatch(viewSettingsActionCreator(storedUi.viewSettings));
    return;
  }

  // Fallback: detecta l'idioma del navegador
  const localeBrowser = navigator.language.slice(0, 2);
  const appLang = langTranslateApp.includes(localeBrowser as LangsApp)
    ? (localeBrowser as LangsApp)
    : "en";
  dispatch(updateLangSettingsActionCreator({ app: appLang, search: appLang, keywords: [] }));
  dispatch(updateThemeActionCreator("system"));
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
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // Ignorar errors de logout al servidor; netegem l'estat local igualment
    }
    setAccessToken(null);
    restoreAnonymousSettings(dispatch);
  },
);

// Thunk: refresh silent (cridat a AppBootstrap per restaurar la sessió)
export const refreshSessionThunk = createAsyncThunk(
  "auth/refreshSession",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken } = await authService.refreshToken();
      setAccessToken(accessToken);
      const payload = JSON.parse(atob(accessToken.split(".")[1])) as {
        userId: string;
        email: string;
      };
      await syncSettingsAfterAuth(dispatch);
      return { accessToken, email: payload.email };
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
    clearAuthState: (state) => {
      state.accessToken = null;
      state.userEmail = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.errorCode = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ accessToken: string; email: string }>) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.userEmail = action.payload.email;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.errorCode = action.payload as string;
      });

    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.errorCode = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<{ accessToken: string; email: string }>) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.userEmail = action.payload.email;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.errorCode = action.payload as string;
      });

    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.accessToken = null;
        state.userEmail = null;
        state.errorCode = null;
      });

    builder
      .addCase(refreshSessionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshSessionThunk.fulfilled, (state, action: PayloadAction<{ accessToken: string; email: string }>) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.userEmail = action.payload.email;
      })
      .addCase(refreshSessionThunk.rejected, (state) => {
        state.isLoading = false;
        state.accessToken = null;
        state.userEmail = null;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export const authReducer = authSlice.reducer;
