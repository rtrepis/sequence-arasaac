// Lògica de negoci del mòdul de user-settings
// Cap dependència d'Express — treballa únicament amb UserModel

import type { DefaultSettings, LangsApp } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { UserModel } from "../auth/model";
import type { UpdateSettingsInput, UpdateLangInput } from "./validators";

// Resposta del GET — inclou settings i langSettings
export interface UserSettingsResponse {
  settings: DefaultSettings;
  langSettings: { app: LangsApp; search: string };
}

// Retorna els settings i langSettings de l'usuari autenticat
export const getSettings = async (
  userId: string
): Promise<UserSettingsResponse> => {
  const user = await UserModel.findById(userId).select("settings langSettings");

  if (!user) {
    const error = new Error("Usuari no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }

  return {
    settings: user.settings,
    langSettings: user.langSettings,
  };
};

// Actualitza els DefaultSettings de l'usuari
export const updateSettings = async (
  userId: string,
  settings: UpdateSettingsInput
): Promise<{ settings: DefaultSettings }> => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { settings } },
    { new: true, runValidators: true }
  ).select("settings");

  if (!user) {
    const error = new Error("Usuari no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }

  return { settings: user.settings };
};

// Actualitza els langSettings de l'usuari
export const updateLang = async (
  userId: string,
  lang: UpdateLangInput
): Promise<{ langSettings: { app: LangsApp; search: string } }> => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { langSettings: lang } },
    { new: true }
  ).select("langSettings");

  if (!user) {
    const error = new Error("Usuari no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }

  return { langSettings: user.langSettings };
};
