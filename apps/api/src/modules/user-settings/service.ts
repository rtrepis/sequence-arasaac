// Lògica de negoci del mòdul de user-settings
import type {
  UserAsset,
  UserQuotaStatus,
  UserUiSettings,
} from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { UserModel } from "../auth/model";
import type { UpdateUiSettingsInput } from "./validators";
import { DocumentModel } from "../documents/model";
import { SecurityEventModel } from "../security/model";
import { cloudinary } from "../../shared/cloudinaryClient";
import {
  MAX_IMAGE_BYTES,
  assertImagesWithinSize,
  base64Bytes,
  deleteCloudinaryAsset,
  deleteCloudinaryImages,
  estimateIncomingBytes,
  extractPublicId,
  fetchImageDimensions,
  isCloudinaryUrl,
  sumBytes,
  uploadBase64Image,
  uploadBase64Slots,
  userAssetFolder,
  vocabularyAssetFolder,
  type CloudinaryAsset,
  type ImageSlot,
} from "../../shared/imageAssets";
import {
  applyUsageDelta,
  assertWithinQuota,
  resolveUsage,
  type UsageDelta,
} from "../../shared/quota";
import { resolveQuotaLimits } from "../../shared/tierLimits";

const notFound = (): AppError => {
  const error = new Error("Usuari no trobat") as AppError;
  error.statusCode = 404;
  return error;
};

export const getUiSettings = async (userId: string): Promise<UserUiSettings> => {
  const user = await UserModel.findById(userId).select(
    "settings langSettings theme viewSettings wordProfiles imageQuality tier quotaOverride usage emailVerified role"
  );
  if (!user) throw notFound();

  const usage = resolveUsage(user.usage);

  return {
    lang: user.langSettings,
    theme: user.theme ?? "system",
    viewSettings: user.viewSettings ?? undefined,
    defaultSettings: user.settings,
    wordProfiles: user.wordProfiles ?? [],
    imageQuality: user.imageQuality ?? "print",
    tier: user.tier ?? "free",
    emailVerified: user.emailVerified ?? false,
    role: user.role ?? "user",
    // El consum viatja amb les preferències perquè no costa cap petició més:
    // aquesta ja surt a cada restauració de sessió i llegeix el mateix document.
    usage,
    limits: resolveQuotaLimits(user.tier ?? "free", user.quotaOverride),
  };
};

// Consum i límits del compte, per refrescar-los sense tornar a demanar tota la
// configuració: el que canvia després de desar un document són quatre números.
export const getQuotaStatus = async (
  userId: string
): Promise<UserQuotaStatus> => {
  const user = await UserModel.findById(userId)
    .select("tier quotaOverride usage")
    .lean();
  if (!user) throw notFound();

  return {
    usage: resolveUsage(user.usage),
    limits: resolveQuotaLimits(user.tier ?? "free", user.quotaOverride),
    maxImageBytes: MAX_IMAGE_BYTES,
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

  // Opcional: les versions antigues del client no l'envien, i sobreescriure-la
  // amb el valor per defecte els canviaria la preferència sense demanar-ho.
  if (data.imageQuality !== undefined) {
    update.imageQuality = data.imageQuality;
  }

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

// --- Gestió de les imatges pròpies del compte ---

// Totes les imatges que ocupen espai al compte, amb el lloc d'on pengen.
//
// El pes surt del registre d'assets —el mateix d'on el treu la quota—, de manera
// que la suma de la llista i el comptador diuen el mateix. Les pujades abans que
// existís el registre hi surten a zero: el seu pes no es va desar mai, i
// inventar-lo seria pitjor que ensenyar-lo buit.
//
// Es recorre el contingut dels documents i no només el registre perquè la llista
// ha de dir ON és cada imatge: un pes solt no serveix per decidir què esborrar.
export const listUserAssets = async (userId: string): Promise<UserAsset[]> => {
  const user = await UserModel.findById(userId)
    .select("wordProfiles wordProfileAssets")
    .lean();
  if (!user) throw notFound();

  // Sense .lean(): el contingut és una Map de Mongoose i es recorre com a tal.
  // Són com a molt els documents que caben a la quota, uns quilobytes cadascun.
  const documents = await DocumentModel.find({ userId }).select(
    "title content assets"
  );

  const assets: UserAsset[] = [];
  // Una mateixa imatge pot sortir dues vegades al contingut si l'usuari ha
  // duplicat el pictograma, però al núvol només n'hi ha una i només es paga un cop
  const seen = new Set<string>();

  for (const doc of documents) {
    const bytesById = new Map(
      doc.assets.map((asset) => [asset.publicId, asset.bytes])
    );

    for (const sequence of doc.content.values()) {
      for (const pict of sequence) {
        const url = pict.img.url;
        if (!isCloudinaryUrl(url)) continue;

        const publicId = extractPublicId(url as string);
        if (seen.has(publicId)) continue;
        seen.add(publicId);

        assets.push({
          publicId,
          url: url as string,
          bytes: bytesById.get(publicId) ?? 0,
          source: "document",
          documentId: String(doc._id),
          documentTitle: doc.title,
        });
      }
    }
  }

  const wordBytesById = new Map(
    (user.wordProfileAssets ?? []).map((asset) => [asset.publicId, asset.bytes])
  );

  for (const profile of user.wordProfiles ?? []) {
    const url = profile.customImageUrl;
    if (!isCloudinaryUrl(url)) continue;

    const publicId = extractPublicId(url as string);
    if (seen.has(publicId)) continue;
    seen.add(publicId);

    assets.push({
      publicId,
      url: url as string,
      bytes: wordBytesById.get(publicId) ?? 0,
      source: "vocabulary",
      word: profile.word,
    });
  }

  // Les mides es demanen a Cloudinary en una sola petició i per a tota la
  // llista: són el que permet dir a quina mida s'imprimeix bé cada imatge, i
  // sense elles el pes és un número que no vol dir res per a qui no és informàtic
  const dimensions = await fetchImageDimensions(assets.map((a) => a.publicId));
  for (const asset of assets) {
    const size = dimensions.get(asset.publicId);
    if (size) {
      asset.width = size.width;
      asset.height = size.height;
    }
  }

  // Les que més ocupen primer: la llista serveix per alliberar espai, i qui la
  // mira busca què treure, no un inventari per ordre d'arribada
  return assets.sort((a, b) => b.bytes - a.bytes);
};

// Esborra una imatge del compte, sigui d'un document o d'una paraula.
//
// Mateix ordre que a la resta del mòdul: primer s'escriu qui la feia servir,
// després s'esborra del núvol i al final s'ajusta el comptador. Si s'esborrés
// primer, una escriptura fallida deixaria un document apuntant a una imatge que
// ja no existeix — val més una imatge orfe a Cloudinary que un document trencat.
//
// El pictograma d'un document es queda sense imatge (conserva text i número) i
// la paraula del vocabulari es queda amb el seu pictograma d'ARASAAC: cap de les
// dues coses s'esborra, només la imatge que ocupava espai.
export const deleteUserAsset = async (
  userId: string,
  publicId: string
): Promise<void> => {
  const user = await UserModel.findById(userId).select(
    "wordProfiles wordProfileAssets"
  );
  if (!user) throw notFound();

  const profile = user.wordProfiles.find(
    (candidate) =>
      isCloudinaryUrl(candidate.customImageUrl) &&
      extractPublicId(candidate.customImageUrl as string) === publicId
  );

  if (profile) {
    const asset = user.wordProfileAssets.find(
      (candidate) => candidate.publicId === publicId
    );

    profile.customImageUrl = undefined;
    user.wordProfileAssets = user.wordProfileAssets.filter(
      (candidate) => candidate.publicId !== publicId
    );
    user.markModified("wordProfiles");
    await user.save();

    await deleteCloudinaryAsset(publicId);
    await applyUsageDelta(userId, {
      storageBytes: -(asset?.bytes ?? 0),
      assets: asset ? -1 : 0,
    });
    return;
  }

  // Els documents es recorren sencers i no es filtren per `assets.publicId`:
  // les imatges pujades abans que existís el registre no hi són, i també s'han
  // de poder treure de sobre.
  const documents = await DocumentModel.find({ userId });

  for (const doc of documents) {
    let found = false;

    for (const sequence of doc.content.values()) {
      for (const pict of sequence) {
        if (
          isCloudinaryUrl(pict.img.url) &&
          extractPublicId(pict.img.url as string) === publicId
        ) {
          pict.img.url = undefined;
          found = true;
        }
      }
    }

    if (!found) continue;

    // La miniatura del llistat guarda la URL de les imatges pròpies: si no s'hi
    // treu, la fila del document ensenyaria un quadre trencat.
    for (const pict of doc.thumbnail) {
      if (pict.url && extractPublicId(pict.url) === publicId) {
        pict.url = undefined;
      }
    }

    const asset = doc.assets.find((candidate) => candidate.publicId === publicId);
    doc.assets = doc.assets.filter(
      (candidate) => candidate.publicId !== publicId
    );

    doc.markModified("content");
    doc.markModified("thumbnail");
    await doc.save();

    await deleteCloudinaryAsset(publicId);
    await applyUsageDelta(userId, {
      storageBytes: -(asset?.bytes ?? 0),
      assets: asset ? -1 : 0,
    });
    return;
  }

  const error = new Error("ASSET_NOT_FOUND") as AppError;
  error.statusCode = 404;
  error.errorCode = "ASSET_NOT_FOUND";
  throw error;
};

// Canvia de mida una imatge del compte: en puja una de nova, la posa on hi
// havia l'antiga i esborra l'antiga.
//
// És l'altra sortida de la llista d'imatges, i sovint la que toca: esborrar
// recupera tot l'espai però es queda sense imatge, i qui ha imprès sempre a
// mida petita no necessita cap de les dues coses —li sobra resolució, no la
// imatge. La versió reduïda la prepara el client amb el mateix codificador amb
// què les puja, de manera que el resultat és exactament el que hi hauria si
// l'hagués pujada amb aquella qualitat.
//
// Mateix ordre que la resta del mòdul: primer existeix la imatge nova, després
// s'escriu qui la fa servir, després s'esborra la vella del núvol i al final
// s'ajusta el comptador. A l'inrevés, una escriptura fallida deixaria el
// document apuntant a una imatge que ja no existeix.
//
// La URL canvia (és una imatge nova, amb el seu public_id): qui la feia servir
// s'ha d'assabentar, i per això la resposta torna l'asset tal com ha quedat.
export const replaceUserAsset = async (
  userId: string,
  publicId: string,
  image: string
): Promise<UserAsset> => {
  const user = await UserModel.findById(userId).select(
    "wordProfiles wordProfileAssets"
  );
  if (!user) throw notFound();

  const profile = user.wordProfiles.find(
    (candidate) =>
      isCloudinaryUrl(candidate.customImageUrl) &&
      extractPublicId(candidate.customImageUrl as string) === publicId
  );

  // El pes de la imatge que se'n va: el que ja hi havia només es compta si el
  // registre el coneix. Les pujades abans que existís el registre hi valen zero
  // —el seu pes no es va desar mai— i canviar-les de mida les hi dona d'alta.
  const quotaFor = async (previousBytes: number): Promise<void> => {
    await assertWithinQuota(userId, {
      incomingBytes: Math.max(0, base64Bytes(image) - previousBytes),
    });
  };

  if (profile) {
    const previous = user.wordProfileAssets.find(
      (candidate) => candidate.publicId === publicId
    );

    await quotaFor(previous?.bytes ?? 0);
    const uploaded = await uploadBase64Image(
      vocabularyAssetFolder(userId),
      image
    );

    profile.customImageUrl = uploaded.url;
    user.wordProfileAssets = [
      ...user.wordProfileAssets.filter(
        (candidate) => candidate.publicId !== publicId
      ),
      { publicId: uploaded.publicId, bytes: uploaded.bytes },
    ];
    user.markModified("wordProfiles");
    await user.save();

    await deleteCloudinaryAsset(publicId);
    await applyUsageDelta(userId, {
      storageBytes: uploaded.bytes - (previous?.bytes ?? 0),
      assets: previous ? 0 : 1,
    });

    return {
      publicId: uploaded.publicId,
      url: uploaded.url,
      bytes: uploaded.bytes,
      width: uploaded.width,
      height: uploaded.height,
      source: "vocabulary",
      word: profile.word,
    };
  }

  const documents = await DocumentModel.find({ userId });

  for (const doc of documents) {
    const previous = doc.assets.find(
      (candidate) => candidate.publicId === publicId
    );

    // Es busca al contingut i no al registre d'assets: les imatges pujades
    // abans que el registre existís no hi són, i també s'han de poder reduir
    let found = false;
    for (const sequence of doc.content.values()) {
      for (const pict of sequence) {
        if (
          isCloudinaryUrl(pict.img.url) &&
          extractPublicId(pict.img.url as string) === publicId
        ) {
          found = true;
        }
      }
    }

    if (!found) continue;

    await quotaFor(previous?.bytes ?? 0);
    const uploaded = await uploadBase64Image(userAssetFolder(userId), image);

    for (const sequence of doc.content.values()) {
      for (const pict of sequence) {
        if (
          isCloudinaryUrl(pict.img.url) &&
          extractPublicId(pict.img.url as string) === publicId
        ) {
          pict.img.url = uploaded.url;
        }
      }
    }

    // La miniatura del llistat guarda la URL de les imatges pròpies: amb la
    // vella, la fila del document ensenyaria un quadre trencat
    for (const pict of doc.thumbnail) {
      if (pict.url && extractPublicId(pict.url) === publicId) {
        pict.url = uploaded.url;
      }
    }

    doc.assets = [
      ...doc.assets.filter((candidate) => candidate.publicId !== publicId),
      { publicId: uploaded.publicId, bytes: uploaded.bytes },
    ];

    doc.markModified("content");
    doc.markModified("thumbnail");
    await doc.save();

    await deleteCloudinaryAsset(publicId);
    await applyUsageDelta(userId, {
      storageBytes: uploaded.bytes - (previous?.bytes ?? 0),
      assets: previous ? 0 : 1,
    });

    return {
      publicId: uploaded.publicId,
      url: uploaded.url,
      bytes: uploaded.bytes,
      width: uploaded.width,
      height: uploaded.height,
      source: "document",
      documentId: String(doc._id),
      documentTitle: doc.title,
    };
  }

  const missing = new Error("ASSET_NOT_FOUND") as AppError;
  missing.statusCode = 404;
  missing.errorCode = "ASSET_NOT_FOUND";
  throw missing;
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
