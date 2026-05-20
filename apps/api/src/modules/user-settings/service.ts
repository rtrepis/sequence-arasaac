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
  const user = await UserModel.findById(userId).select("settings langSettings theme");
  if (!user) throw notFound();

  return {
    lang: user.langSettings,
    theme: user.theme ?? "system",
    defaultSettings: user.settings,
  };
};

export const updateUiSettings = async (
  userId: string,
  data: UpdateUiSettingsInput
): Promise<void> => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        langSettings: data.lang,
        theme: data.theme,
        settings: data.defaultSettings,
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) throw notFound();
};
