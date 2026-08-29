// Slice Redux per a l'estat d'autenticació de l'usuari.
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setAccessToken } from "../../api/apiClient";
import * as authService from "../services/authService";
import { getUiSettings } from "../../user-settings/services/settingsService";
import {
  updateDefaultSettingsActionCreator,
  updateLangSettingsActionCreator,
  updateThemeActionCreator,
  applyUserViewSettingsActionCreator,
  setWordProfilesActionCreator,
  setTierActionCreator,
} from "@features/user-settings/store/uiSlice";
import {
  clearStoredAccountUi,
  clearStoredWordProfiles,
  getStoredUserUi,
  saveAccountUi,
} from "@features/user-settings/storage/settingsStorage";
import { langTranslateApp } from "../../../../configs/languagesConfigs";
import { LangsApp } from "../../../../types/ui";

export interface AuthState {
  accessToken: string | null;
  userEmail: string | null;
  isLoading: boolean;
  errorCode: string | null;
  // Estat del compte, necessari per decidir què es pot fer i què s'ensenya.
  // null vol dir "encara no ho sabem" (sessió no restaurada): no és el mateix
  // que "no verificat", i mostrar l'avís abans d'hora seria alarmar sense motiu.
  emailVerified: boolean | null;
  isAdmin: boolean;
  // Cert quan el registre ha anat bé però el correu de verificació no ha sortit
  verificationEmailFailed: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  userEmail: null,
  isLoading: false,
  errorCode: null,
  emailVerified: null,
  isAdmin: false,
  verificationEmailFailed: false,
};

// Estat del compte que arriba amb les preferències
interface AccountFlags {
  emailVerified: boolean;
  isAdmin: boolean;
}

// Carrega les preferències del backend al Redux (no toca localStorage — és de l'anònim)
// Retorna l'estat del compte perquè el thunk el pugui desar a l'AuthState.
const syncSettingsAfterAuth = async (
  dispatch: (action: unknown) => void,
): Promise<AccountFlags> => {
  try {
    const settings = await getUiSettings();
    const {
      lang,
      theme,
      defaultSettings,
      viewSettings,
      wordProfiles,
      tier,
      emailVerified,
      role,
    } = settings;

    // Aquest és un dels dos moments on la configuració del compte és certa (l'altre
    // és quan l'usuari la desa): es guarda per pintar-hi la propera arrencada
    // sense haver d'esperar el servidor
    saveAccountUi(settings);

    dispatch(updateDefaultSettingsActionCreator(defaultSettings));
    dispatch(
      updateLangSettingsActionCreator({ app: lang.app, search: lang.search }),
    );
    dispatch(updateThemeActionCreator(theme ?? "system"));
    if (viewSettings)
      dispatch(applyUserViewSettingsActionCreator(viewSettings));
    if (wordProfiles) dispatch(setWordProfilesActionCreator(wordProfiles));
    if (tier) dispatch(setTierActionCreator(tier));
    return { emailVerified: emailVerified ?? false, isAdmin: role === "admin" };
  } catch {
    // Si falla la sincronització no interrompem el flux d'auth.
    // Es concedeix el benefici del dubte: un error de xarxa no ha de fer
    // aparèixer un avís de "verifica el correu" a qui ja el té verificat.
    return { emailVerified: true, isAdmin: false };
  }
};

// Restaura les preferències anònimes del localStorage al Redux després del logout
const restoreAnonymousSettings = (
  dispatch: (action: unknown) => void,
): void => {
  // El vocabulari personal és del compte, no del dispositiu: només s'hi arriba amb
  // sessió iniciada. Si no es buida en sortir, es queda a la memòria de l'aplicació
  // —i el cercador continua aplicant-lo— i acaba escrit al navegador com si fos
  // configuració anònima. En un dispositiu compartit, que és el cas normal en AAC,
  // això vol dir deixar-hi el vocabulari de qui l'ha fet servir abans.
  dispatch(setWordProfilesActionCreator([]));

  // La cara del compte tampoc no s'ha de quedar al dispositiu: sense això, la
  // propera arrencada anònima tindria el tema i l'idioma de qui ha sortit
  clearStoredAccountUi();

  const storedUi = getStoredUserUi();

  if (storedUi) {
    dispatch(updateDefaultSettingsActionCreator(storedUi.defaultSettings));
    dispatch(updateThemeActionCreator(storedUi.theme));
    dispatch(
      updateLangSettingsActionCreator({
        app: storedUi.lang.app,
        search: storedUi.lang.search,
      }),
    );
    if (storedUi.viewSettings)
      dispatch(applyUserViewSettingsActionCreator(storedUi.viewSettings));
    return;
  }

  // Fallback: detecta l'idioma del navegador
  const localeBrowser = navigator.language.slice(0, 2);
  const appLang = langTranslateApp.includes(localeBrowser as LangsApp)
    ? (localeBrowser as LangsApp)
    : "en";
  dispatch(updateLangSettingsActionCreator({ app: appLang, search: appLang }));
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
      const account = await syncSettingsAfterAuth(dispatch);
      return { accessToken, email, ...account };
    } catch (error: unknown) {
      const errorCode =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "AUTH_ERROR";
      return rejectWithValue(errorCode);
    }
  },
);

// Thunk: setPassword — estableix la contrasenya (verificació inicial o
// recuperació) a partir del token de l'enllaç del correu, i fa login automàtic.
// Mateix contracte que loginThunk: qui el crida ja té la pàgina SetPasswordPage
// gestionant el seu propi isLoading local, així que aquí no cal tocar-lo.
export const setPasswordThunk = createAsyncThunk(
  "auth/setPassword",
  async (
    {
      token,
      password,
      passwordConfirmation,
    }: { token: string; password: string; passwordConfirmation: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { accessToken } = await authService.setPassword(
        token,
        password,
        passwordConfirmation,
      );
      setAccessToken(accessToken);
      const account = await syncSettingsAfterAuth(dispatch);
      const payload = JSON.parse(atob(accessToken.split(".")[1])) as {
        email: string;
      };
      return { accessToken, email: payload.email, ...account };
    } catch (error: unknown) {
      const errorCode =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "SET_PASSWORD_ERROR";
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
    // També del navegador, no només de la memòria: el que ja hi hagi escrit d'una
    // sessió anterior ocupa espai i no és d'aquest dispositiu
    clearStoredWordProfiles();
    restoreAnonymousSettings(dispatch);
  },
);

// Thunk: refresh silent (cridat a AppBootstrap per restaurar la sessió)
export const refreshSessionThunk = createAsyncThunk(
  "auth/refreshSession",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // De fons: aquesta crida surt sola en arrencar l'app i, de passada, ja desperta
      // el servidor de Render abans que l'usuari en necessiti res.
      const { accessToken } = await authService.refreshToken(true);
      setAccessToken(accessToken);
      const payload = JSON.parse(atob(accessToken.split(".")[1])) as {
        userId: string;
        email: string;
      };
      const account = await syncSettingsAfterAuth(dispatch);
      return { accessToken, email: payload.email, ...account };
    } catch {
      setAccessToken(null);
      // La sessió que havia deixat aquesta caché ja no existeix. No es repinta
      // el que hi ha a pantalla —seria tornar a fer el salt que la caché evita,
      // i just quan l'avís de sessió caducada ja ho està explicant—, però la
      // propera arrencada ja ha de ser anònima.
      clearStoredAccountUi();
      return rejectWithValue("Sessió caducada");
    }
  },
);

// Payload comú a login, registre i restauració de sessió
interface AuthSuccessPayload {
  accessToken: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  verificationEmailFailed?: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.accessToken = null;
      state.userEmail = null;
      state.errorCode = null;
      state.emailVerified = null;
      state.isAdmin = false;
      state.verificationEmailFailed = false;
    },
    // La crida a /auth/verify ha anat bé: l'avís ha de desaparèixer a l'instant,
    // sense esperar la propera restauració de sessió
    markEmailVerified: (state) => {
      state.emailVerified = true;
      state.verificationEmailFailed = false;
    },
    // El reenviament ha sortit: deixa de tenir sentit l'avís d'error d'enviament
    markVerificationEmailSent: (state) => {
      state.verificationEmailFailed = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.errorCode = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<AuthSuccessPayload>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.userEmail = action.payload.email;
          state.emailVerified = action.payload.emailVerified;
          state.isAdmin = action.payload.isAdmin;
        },
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.errorCode = action.payload as string;
      });

    builder
      .addCase(setPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.errorCode = null;
      })
      .addCase(
        setPasswordThunk.fulfilled,
        (state, action: PayloadAction<AuthSuccessPayload>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.userEmail = action.payload.email;
          state.emailVerified = action.payload.emailVerified;
          state.isAdmin = action.payload.isAdmin;
        },
      )
      .addCase(setPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.errorCode = action.payload as string;
      });

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.accessToken = null;
      state.userEmail = null;
      state.errorCode = null;
      state.emailVerified = null;
      state.isAdmin = false;
      state.verificationEmailFailed = false;
    });

    builder
      .addCase(refreshSessionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        refreshSessionThunk.fulfilled,
        (state, action: PayloadAction<AuthSuccessPayload>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.userEmail = action.payload.email;
          state.emailVerified = action.payload.emailVerified;
          state.isAdmin = action.payload.isAdmin;
        },
      )
      .addCase(refreshSessionThunk.rejected, (state) => {
        state.isLoading = false;
        state.accessToken = null;
        state.userEmail = null;
        state.emailVerified = null;
        state.isAdmin = false;
      });
  },
});

export const { clearAuthState, markEmailVerified, markVerificationEmailSent } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
