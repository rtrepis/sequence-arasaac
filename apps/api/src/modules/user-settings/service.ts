// Lògica de negoci del mòdul de user-settings
import type { UserUiSettings } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { UserModel } from "../auth/model";
import type { UpdateUiSettingsInput } from "./validators";
import { resolveQuotaLimits } from "../../shared/tierLimits";
import { DocumentModel } from "../documents/model";
import { SecurityEventModel } from "../security/model";
import { cloudinary } from "../../shared/cloudinaryClient";

const notFound = (): AppError => {
  const error = new Error("Usuari no trobat") as AppError;
  error.statusCode = 404;
  return error;
};

const quotaExceeded = (): AppError => {
  const error = new Error("QUOTA_WORD_PROFILES_EXCEEDED") as AppError;
  error.statusCode = 403;
  error.errorCode = "QUOTA_WORD_PROFILES_EXCEEDED";
  return error;
};

export const getUiSettings = async (userId: string): Promise<UserUiSettings> => {
  const user = await UserModel.findById(userId).select(
    "settings langSettings theme viewSettings wordProfiles tier emailVerified role"
  );
  if (!user) throw notFound();

  return {
    lang: user.langSettings,
    theme: user.theme ?? "system",
    viewSettings: user.viewSettings ?? undefined,
    defaultSettings: user.settings,
    wordProfiles: user.wordProfiles ?? [],
    tier: user.tier ?? "free",
    emailVerified: user.emailVerified ?? false,
    role: user.role ?? "user",
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
    // Els perfils de paraula poden portar imatges personalitzades: sense sostre,
    // un sol usuari podria fer créixer el seu document indefinidament
    const owner = await UserModel.findById(userId)
      .select("tier quotaOverride")
      .lean();

    if (!owner) throw notFound();

    const limits = resolveQuotaLimits(owner.tier, owner.quotaOverride);
    if (data.wordProfiles.length > limits.wordProfiles) {
      throw quotaExceeded();
    }

    update.wordProfiles = data.wordProfiles;
    // El comptador es fixa al valor real: aquí es reemplaça tota la llista,
    // de manera que un $inc no tindria sentit
    update["usage.wordProfilesCount"] = data.wordProfiles.length;
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!user) throw notFound();
};

// Esborra el compte i tot el que en penja.
//
// No és una funció d'antifrau sinó una obligació: l'app la fan servir famílies
// i centres educatius, i un usuari ha de poder endur-se'n les seves dades.
// L'ordre és deliberat — primer les imatges (el que costa diners i el que un
// error deixaria orfe per sempre), i l'usuari l'últim, perquè si alguna cosa
// falla pel camí el compte encara existeixi i es pugui reintentar.
export const deleteAccount = async (userId: string): Promise<void> => {
  const user = await UserModel.findById(userId).select("_id").lean();
  if (!user) throw notFound();

  // Cloudinary organitza les imatges per carpeta d'usuari (vegeu documents/service.ts)
  try {
    await cloudinary.api.delete_resources_by_prefix(`seq/${userId}`);
    await cloudinary.api.delete_folder(`seq/${userId}`);
  } catch (error) {
    // Una carpeta inexistent (usuari que no ha pujat mai cap imatge) fa saltar
    // l'API de Cloudinary. No pot impedir que l'usuari esborri el seu compte.
    console.error("Neteja de Cloudinary incompleta en esborrar el compte:", error);
  }

  await DocumentModel.deleteMany({ userId });
  await SecurityEventModel.deleteMany({ userId });
  await UserModel.findByIdAndDelete(userId);
};
