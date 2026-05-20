// Thunk únic per persistir tota la configuració UI de l'usuari.
// Autenticat → una sola crida PUT /user/ui-settings.
// Anònim → una sola escriptura a localStorage (clau userUi).
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserUiSettings } from "../../../../types/ui";
import { RootState } from "../../../../app/store";
import { saveUserUi } from "@features/user-settings/storage/settingsStorage";
import { updateUiSettings } from "../services/settingsService";

const buildUserUiFromState = (state: RootState): UserUiSettings => ({
  lang: { app: state.ui.lang.app, search: state.ui.lang.search },
  theme: state.ui.theme,
  defaultSettings: state.ui.defaultSettings,
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
