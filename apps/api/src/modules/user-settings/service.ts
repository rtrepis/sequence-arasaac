// Lògica de negoci del mòdul de user-settings
import type { UserUiSettings } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { UserModel } from "../auth/model";
import type { UpdateUiSettingsInput } from "./validators";
import { DocumentModel } from "../documents/model";
import { SecurityEventModel } from "../security/model";
import { cloudinary } from "../../shared/cloudinaryClient";
import {
  assertImagesWithinSize,
  deleteCloudinaryImages,
  estimateIncomingBytes,
  extractPublicId,
  isCloudinaryUrl,
  sumBytes,
  uploadBase64Slots,
  userAssetFolder,
  vocabularyAssetFolder,
  type CloudinaryAsset,
  type ImageSlot,
} from "../../shared/imageAssets";
import {
  applyUsageDelta,
  assertWithinQuota,
  type UsageDelta,
} from "../../shared/quota";

const notFound = (): AppError => {
  const error = new Error("Usuari no trobat") as AppError;
  error.statusCode = 404;
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

// Desa la configuració de l'usuari.
//
// Les imatges del vocabulari personal pugen a Cloudinary abans de tocar la base
// de dades, exactament com fa el mòdul de documents. Abans s'hi desaven en
// base64 tal com arribaven: no passaven per cap quota, i el document d'usuari
// topava amb el límit de 16 MB de MongoDB a la vint-i-quatrena imatge.
//
// Retorna els perfils tal com han quedat desats — amb les URLs definitives— per
// dues raons: sense això el client tornaria a enviar el mateix base64 al desat
// següent, i cada desat seria una pujada nova i un esborrat de l'anterior.
export const updateUiSettings = async (
  userId: string,
  data: UpdateUiSettingsInput
): Promise<UpdateUiSettingsInput["wordProfiles"]> => {
  const update: Record<string, unknown> = {
    langSettings: data.lang,
    theme: data.theme,
    viewSettings: data.viewSettings,
    settings: data.defaultSettings,
  };

  // El consum i l'esborrat de les imatges que sobren s'apliquen DESPRÉS
  // d'escriure els perfils. Esborrar-les abans i que després l'escriptura
  // fallés deixaria els perfils desats apuntant a imatges que ja no existeixen:
  // val més una imatge orfe a Cloudinary que un vocabulari trencat.
  let usageDelta: UsageDelta | undefined;
  let orphanUrls: string[] = [];

  if (data.wordProfiles !== undefined) {
    const owner = await UserModel.findById(userId)
      .select("tier quotaOverride usage wordProfiles wordProfileAssets")
      .lean();

    if (!owner) throw notFound();

    // Una ranura per perfil: la lògica de Cloudinary només necessita saber
    // llegir i escriure la URL, no com és un perfil de paraula.
    const slots: ImageSlot[] = data.wordProfiles.map((profile) => ({
      url: profile.customImageUrl,
      assign: (url: string) => {
        profile.customImageUrl = url;
      },
    }));

    assertImagesWithinSize(slots);
    await assertWithinQuota(userId, {
      incomingBytes: estimateIncomingBytes(slots),
      wordProfiles: data.wordProfiles.length,
    });

    // Imatges que el vocabulari tenia abans d'aquest desat
    const previousUrls = (owner.wordProfiles ?? []).flatMap((profile) =>
      isCloudinaryUrl(profile.customImageUrl) ? [profile.customImageUrl as string] : []
    );

    const uploaded = await uploadBase64Slots(vocabularyAssetFolder(userId), slots);

    // El desat reemplaça la llista sencera, de manera que una imatge que ja no
    // hi surt és una imatge que ningú tornarà a fer servir
    const keptUrls = new Set(
      data.wordProfiles.flatMap((profile) =>
        isCloudinaryUrl(profile.customImageUrl) ? [profile.customImageUrl as string] : []
      )
    );
    orphanUrls = previousUrls.filter((url) => !keptUrls.has(url));

    // El pes de les orfes surt del registre d'assets. Les pujades abans que
    // existís el registre compten com a zero: el seu pes no es va arribar a
    // desar mai i inventar-lo seria pitjor que ignorar-lo.
    const orphanPublicIds = new Set(orphanUrls.map(extractPublicId));
    const previousAssets = owner.wordProfileAssets ?? [];
    const orphanAssets = previousAssets.filter((asset) =>
      orphanPublicIds.has(asset.publicId)
    );
    const remainingAssets = previousAssets.filter(
      (asset) => !orphanPublicIds.has(asset.publicId)
    );
    const newAssets: CloudinaryAsset[] = uploaded.map(({ publicId, bytes }) => ({
      publicId,
      bytes,
    }));

    update.wordProfiles = data.wordProfiles;
    update.wordProfileAssets = [...remainingAssets, ...newAssets];
    // El comptador es fixa al valor real: aquí es reemplaça tota la llista,
    // de manera que un $inc no tindria sentit
    update["usage.wordProfilesCount"] = data.wordProfiles.length;

    usageDelta = {
      storageBytes: sumBytes(newAssets) - sumBytes(orphanAssets),
      assets: newAssets.length - orphanAssets.length,
    };
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!user) throw notFound();

  await deleteCloudinaryImages(orphanUrls);

  if (usageDelta) {
    await applyUsageDelta(userId, usageDelta);
  }

  return data.wordProfiles;
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
    // El prefix del compte cobreix també la subcarpeta de vocabulari, però
    // delete_folder es nega a esborrar una carpeta que encara en conté una altra:
    // la de dins ha d'anar primer.
    await cloudinary.api.delete_resources_by_prefix(userAssetFolder(userId));
    await cloudinary.api.delete_folder(vocabularyAssetFolder(userId));
    await cloudinary.api.delete_folder(userAssetFolder(userId));
  } catch (error) {
    // Una carpeta inexistent (usuari que no ha pujat mai cap imatge) fa saltar
    // l'API de Cloudinary. No pot impedir que l'usuari esborri el seu compte.
    console.error("Neteja de Cloudinary incompleta en esborrar el compte:", error);
  }

  await DocumentModel.deleteMany({ userId });
  await SecurityEventModel.deleteMany({ userId });
  await UserModel.findByIdAndDelete(userId);
};
