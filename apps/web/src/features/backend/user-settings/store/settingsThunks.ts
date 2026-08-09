// Thunk únic per persistir tota la configuració UI de l'usuari.
// Autenticat → una sola crida PUT /user/ui-settings.
// Anònim → una sola escriptura a localStorage (clau userUi).
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserUiSettings, ViewSettings } from "../../../../types/ui";
import { WordProfile } from "@features/word-profile/model/WordProfile";
import { RootState } from "../../../../app/store";
import { saveUserUi } from "@features/user-settings/storage/settingsStorage";
import { updateUiSettings } from "../services/settingsService";
import {
  VIEW_DEFAULT_ALIGNMENT_H,
  VIEW_DEFAULT_ALIGNMENT_V,
  VIEW_DEFAULT_DIRECTION,
  VIEW_DEFAULT_ORIENTATION,
  VIEW_DEFAULT_PAGE_SIZE,
  VIEW_DEFAULT_PICT_SPACE,
  VIEW_DEFAULT_SEQ_SPACE,
  VIEW_DEFAULT_SIZE_PICT,
  VIEW_DEFAULT_AUTHOR,
} from "@/configs/viewSettingsConfig";

// Garanteix que tots els camps de viewSettings tinguin valor vàlid,
// per si la BD té dades antigues sense camps nous (ex: alignmentH/V).
const sanitizeViewSettings = (vs: ViewSettings): ViewSettings => ({
  sizePict: vs.sizePict ?? VIEW_DEFAULT_SIZE_PICT,
  pictSpaceBetween: vs.pictSpaceBetween ?? VIEW_DEFAULT_PICT_SPACE,
  sequenceSpaceBetween: vs.sequenceSpaceBetween ?? VIEW_DEFAULT_SEQ_SPACE,
  direction: vs.direction ?? VIEW_DEFAULT_DIRECTION,
  alignmentH: vs.alignmentH ?? VIEW_DEFAULT_ALIGNMENT_H,
  alignmentV: vs.alignmentV ?? VIEW_DEFAULT_ALIGNMENT_V,
  pageSize: vs.pageSize ?? VIEW_DEFAULT_PAGE_SIZE,
  orientation: vs.orientation ?? VIEW_DEFAULT_ORIENTATION,
  author: vs.author ?? VIEW_DEFAULT_AUTHOR,
});

// Normalitza el camp fitzgerald d'un WordProfile: si per error antic s'ha
// guardat com a objecte FitzgeraldColor { value, color }, extreu el color hex.
const sanitizeWordProfiles = (profiles: WordProfile[]): WordProfile[] =>
  profiles.map((p) => {
    const fitz = p.overrides.fitzgerald;
    if (fitz && typeof fitz === "object") {
      return {
        ...p,
        overrides: {
          ...p.overrides,
          fitzgerald: (fitz as { color: string }).color,
        },
      };
    }
    return p;
  });

const buildUserUiFromState = (state: RootState): UserUiSettings => ({
  lang: { app: state.ui.lang.app, search: state.ui.lang.search },
  theme: state.ui.theme,
  viewSettings: sanitizeViewSettings(state.ui.viewSettings),
  defaultSettings: state.ui.defaultSettings,
  wordProfiles: sanitizeWordProfiles(state.ui.wordProfiles),
});

export const saveUserUiThunk = createAsyncThunk<void, void, { state: RootState }>(
  "user-settings/saveUserUi",
  async (_, { getState }) => {
    const payload = buildUserUiFromState(getState());
    const isAuthenticated = getState().auth.accessToken !== null;

    if (isAuthenticated) {
      await updateUiSettings(payload);
    } else {
      saveUserUi(payload);
    }
  }
);
