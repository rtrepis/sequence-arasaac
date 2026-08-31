// Capa de servei per sincronitzar la configuració de l'usuari amb el backend.
import apiClient from "../../api/apiClient";
import { UserUiSettings } from "../../../../types/ui";
import { WordProfile } from "@features/word-profile/model/WordProfile";

// El desat torna els perfils tal com han quedat desats: les imatges pròpies
// pugen a Cloudinary al servidor, i el que el client tenia era el base64. Sense
// adoptar aquestes URLs, el desat següent tornaria a enviar la mateixa imatge i
// el servidor la pujaria un altre cop.
export interface UpdateUiSettingsResponse {
  ok: boolean;
  wordProfiles?: WordProfile[];
}

export const getUiSettings = async (): Promise<UserUiSettings> => {
  const { data } = await apiClient.get<UserUiSettings>("/user/ui-settings");
  return data;
};

export const updateUiSettings = async (
  settings: UserUiSettings,
): Promise<UpdateUiSettingsResponse> => {
  const { data } = await apiClient.put<UpdateUiSettingsResponse>(
    "/user/ui-settings",
    settings,
  );
  return data;
};
