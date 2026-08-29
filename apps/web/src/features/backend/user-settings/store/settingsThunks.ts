// Thunk únic per persistir tota la configuració UI de l'usuari.
// Autenticat → una sola crida PUT /user/ui-settings.
// Anònim → una sola escriptura a localStorage (clau userUi).
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserUiSettings } from "../../../../types/ui";
import { WordProfile } from "@features/word-profile/model/WordProfile";
import { RootState } from "../../../../app/store";
import {
  saveAccountUi,
  saveUserUi,
} from "@features/user-settings/storage/settingsStorage";
import { updateUiSettings } from "../services/settingsService";
import {
  classifyRequestFailure,
  RequestFailure,
} from "@features/backend/api/requestFailure";
import { sanitizeViewSettings } from "@/configs/viewSettingsConfig";

// Normalitza el camp fitzgerald d'un WordProfile: si per error antic s'ha
// guardat com a objecte FitzgeraldColor { value, color }, extreu el color hex.
// `overrides` pot no existir en paraules desades abans que el camp fos obligatori.
// Sense aquest recanvi, llegir-hi a dins llançava i tombava el desat sencer de la
// configuració: la petició no arribava a sortir i l'usuari veia un error sense causa.
const sanitizeWordProfiles = (profiles: WordProfile[] = []): WordProfile[] =>
  profiles.map((profile) => {
    const overrides = profile.overrides ?? {};
    const fitzgerald = overrides.fitzgerald;

    if (fitzgerald && typeof fitzgerald === "object") {
      return {
        ...profile,
        overrides: {
          ...overrides,
          fitzgerald: (fitzgerald as { color: string }).color,
        },
      };
    }

    return { ...profile, overrides };
  });

const buildUserUiFromState = (state: RootState): UserUiSettings => ({
  lang: { app: state.ui.lang.app, search: state.ui.lang.search },
  theme: state.ui.theme,
  viewSettings: sanitizeViewSettings(state.ui.viewSettings),
  defaultSettings: state.ui.defaultSettings,
  wordProfiles: sanitizeWordProfiles(state.ui.wordProfiles),
});

export const saveUserUiThunk = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: RequestFailure }
>("user-settings/saveUserUi", async (_, { getState, rejectWithValue }) => {
  try {
    // Construir el payload va dins del try: si peta aquí (un camp que falta en
    // dades antigues), el thunk es rebutjava sense passar per rejectWithValue i
    // l'error arribava sense codi ni causa, indistingible d'una fallada de xarxa.
    const payload = buildUserUiFromState(getState());
    const isAuthenticated = getState().auth.accessToken !== null;

    if (isAuthenticated) {
      await updateUiSettings(payload);
      // La caché d'arrencada avança amb el que l'usuari acaba de desar; si no,
      // la propera vegada s'hi pintaria la configuració anterior
      saveAccountUi(payload);
    } else {
      // Sense sessió no hi ha vocabulari personal: la funcionalitat només existeix
      // dins d'un compte. Escriure'l al navegador només serviria per omplir-lo
      // d'imatges en base64 —fins a deixar-lo sense espai— i per deixar-hi el
      // vocabulari de qui hagi tancat sessió abans en un dispositiu compartit.
      saveUserUi({ ...payload, wordProfiles: [] });
    }
  } catch (error) {
    // La fallada surt classificada: qui la rep ha de poder decidir si reintenta
    // sol o si val més avisar l'usuari, i amb quin missatge.
    return rejectWithValue(classifyRequestFailure(error));
  }
});
