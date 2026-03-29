// Thunk per sincronitzar els settings de l'usuari amb el backend.
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DefaultSettings } from "../../../../types/ui";
import { RootState } from "../../../../app/store";
import { updateDefaultSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { saveSettings } from "@features/user-settings/storage/settingsStorage";
import { updateSettings } from "../services/settingsService";

// Retorna { synced: true } si ha sincronitzat amb backend, { synced: false } si no hi havia sessió.
export const saveSettingsThunk = createAsyncThunk<
  { synced: boolean },
  DefaultSettings,
  { state: RootState }
>("user-settings/save", async (settings, { dispatch, getState }) => {
  // Sempre actualitza Redux i storage local
  dispatch(updateDefaultSettingsActionCreator(settings));
  saveSettings(settings);

  // Sincronitza amb backend només si l'usuari té sessió activa
  const isAuthenticated = getState().auth.accessToken !== null;
  if (!isAuthenticated) {
    return { synced: false };
  }

  await updateSettings(settings);
  return { synced: true };
});
