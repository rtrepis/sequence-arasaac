// Capa de servei per sincronitzar la configuració de l'usuari amb el backend.
import apiClient from "../../api/apiClient";
import { DefaultSettings, LangsApp } from "../../../../types/ui";

export interface UserSettingsResponse {
  settings: DefaultSettings;
  langSettings: { app: LangsApp; search: string };
}

export const getSettings = async (): Promise<UserSettingsResponse> => {
  const { data } = await apiClient.get<UserSettingsResponse>("/user/settings");
  return data;
};

export const updateSettings = async (
  settings: DefaultSettings,
): Promise<void> => {
  await apiClient.put("/user/settings", settings);
};

export const updateLang = async (lang: {
  app: LangsApp;
  search: string;
}): Promise<void> => {
  await apiClient.put("/user/lang", lang);
};
