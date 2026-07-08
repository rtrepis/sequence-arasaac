// Lògica de negoci del mòdul de user-settings
import type { UserUiSettings } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { UserModel } from "../auth/model";
import type { UpdateUiSettingsInput } from "./validators";

const notFound = (): AppError => {
  const error = new Error("Usuari no trobat") as AppError;
  error.statusCode = 404;
  return error;
};

export const getUiSettings = async (userId: string): Promise<UserUiSettings> => {
  const user = await UserModel.findById(userId).select("settings langSettings theme viewSettings wordProfiles tier");
  if (!user) throw notFound();

  return {
    lang: user.langSettings,
    theme: user.theme ?? "system",
    viewSettings: user.viewSettings ?? undefined,
    defaultSettings: user.settings,
    wordProfiles: user.wordProfiles ?? [],
    tier: user.tier ?? "free",
  };
};

export const updateUiSettings = async (
  userId: string,
  data: UpdateUiSettingsInput
): Promise<void> => {
  const update: Record<string, unknown> = {
    langSettings: data.lang,
    theme: data.theme,
    viewSettings: data.viewSettings,
    settings: data.defaultSettings,
  };

  if (data.wordProfiles !== undefined) {
    update.wordProfiles = data.wordProfiles;
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!user) throw notFound();
};
