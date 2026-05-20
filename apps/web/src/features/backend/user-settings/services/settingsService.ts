// Capa de servei per sincronitzar la configuració de l'usuari amb el backend.
import apiClient from "../../api/apiClient";
import { UserUiSettings } from "../../../../types/ui";

export const getUiSettings = async (): Promise<UserUiSettings> => {
  const { data } = await apiClient.get<UserUiSettings>("/user/ui-settings");
  return data;
};

export const updateUiSettings = async (settings: UserUiSettings): Promise<void> => {
  await apiClient.put("/user/ui-settings", settings);
};
