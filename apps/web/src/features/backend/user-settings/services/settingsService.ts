// Capa de servei per sincronitzar la configuració de l'usuari amb el backend.
import apiClient from "../../api/apiClient";
import { UserUiSettings } from "../../../../types/ui";
import { WordProfile } from "@features/word-profile/model/WordProfile";
import type {
  UserAsset,
  UserQuotaStatus,
} from "@sequence-arasaac/shared-types";

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

// Consum i límits del compte. Es demana a part de la configuració quan cal
// refrescar-los —després de desar o d'esborrar—: el que canvia són quatre
// números i no val la pena tornar-se a baixar el vocabulari sencer.
export const getQuotaStatus = async (): Promise<UserQuotaStatus> => {
  const { data } = await apiClient.get<UserQuotaStatus>("/user/quota");
  return data;
};

// Imatges pròpies del compte, amb el document o la paraula d'on pengen
export const listUserAssets = async (): Promise<UserAsset[]> => {
  const { data } = await apiClient.get<{ assets: UserAsset[] }>("/user/assets");
  return data.assets;
};

// Treu una imatge del compte. El pictograma o la paraula que la feien servir es
// conserven; el que se'n va és la imatge i l'espai que ocupava.
export const deleteUserAsset = async (publicId: string): Promise<void> => {
  await apiClient.delete("/user/assets", { data: { publicId } });
};

// Canvia de mida una imatge del compte: hi puja la versió reduïda que ha
// preparat el navegador i en torna l'asset tal com ha quedat. La URL canvia
// —al núvol és una imatge nova— i per això qui la feia servir l'ha d'adoptar.
export const resizeUserAsset = async (
  publicId: string,
  image: string,
): Promise<UserAsset> => {
  const { data } = await apiClient.patch<{ asset: UserAsset }>("/user/assets", {
    publicId,
    image,
  });
  return data.asset;
};
