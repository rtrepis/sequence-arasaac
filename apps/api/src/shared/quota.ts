// Comprovació de quota i comptadors de consum
//
// Viu aquí i no dins d'un mòdul perquè el pes que gasta un usuari és un de sol,
// repartit entre els documents i el vocabulari personal: si cada mòdul tingués
// la seva comprovació, la suma dels dos límits no seria el límit del compte.
//
// La regla que no es pot trencar: es comprova SEMPRE abans de pujar res a
// Cloudinary. Pujar primer i rebutjar després deixa imatges orfes ja pagades.

import { UserModel } from "../modules/auth/model";
import { resolveQuotaLimits } from "./tierLimits";
import type { AppError } from "../middleware/errorHandler";

const quotaError = (errorCode: string, statusCode: number): AppError => {
  const error = new Error(errorCode) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
};

export interface QuotaRequest {
  // Bytes de les imatges noves que porta la petició, encara sense pujar
  incomingBytes: number;
  // Cert quan la petició crea un document més
  newDocument?: boolean;
  // Recompte TOTAL de paraules que quedaran desades, no l'increment: el desat
  // del vocabulari reemplaça la llista sencera
  wordProfiles?: number;
}

export interface UsageDelta {
  documents?: number;
  storageBytes?: number;
  assets?: number;
  wordProfiles?: number;
}

export const assertWithinQuota = async (
  userId: string,
  request: QuotaRequest
): Promise<void> => {
  const user = await UserModel.findById(userId)
    .select("tier quotaOverride usage")
    .lean();

  if (!user) {
    throw quotaError("USER_NOT_FOUND", 401);
  }

  const limits = resolveQuotaLimits(user.tier, user.quotaOverride);

  // Els comptes creats abans que existís el camp `usage` no el tenen, i amb .lean()
  // Mongoose no aplica els valors per defecte de l'esquema: sense aquest recanvi,
  // llegir-hi a dins llançava i desar acabava en un 500 sense causa visible.
  // Comptar-los com a zero és el que ja fa la migració amb els antics.
  const usage = user.usage ?? {
    documentsCount: 0,
    wordProfilesCount: 0,
    storageBytes: 0,
    assetsCount: 0,
  };

  if (request.newDocument && usage.documentsCount >= limits.documents) {
    throw quotaError("QUOTA_DOCUMENTS_EXCEEDED", 403);
  }

  if (
    request.wordProfiles !== undefined &&
    request.wordProfiles > limits.wordProfiles
  ) {
    throw quotaError("QUOTA_WORD_PROFILES_EXCEEDED", 403);
  }

  if (usage.storageBytes + request.incomingBytes > limits.storageBytes) {
    throw quotaError("QUOTA_STORAGE_EXCEEDED", 403);
  }
};

// Aplica una variació als comptadors de consum de l'usuari.
// $inc en una sola operació: el comptador i el recurs canvien alhora.
export const applyUsageDelta = async (
  userId: string,
  delta: UsageDelta
): Promise<void> => {
  const increments: Record<string, number> = {};

  if (delta.documents) increments["usage.documentsCount"] = delta.documents;
  if (delta.storageBytes) increments["usage.storageBytes"] = delta.storageBytes;
  if (delta.assets) increments["usage.assetsCount"] = delta.assets;
  if (delta.wordProfiles) increments["usage.wordProfilesCount"] = delta.wordProfiles;

  if (Object.keys(increments).length === 0) {
    return;
  }

  await UserModel.updateOne({ _id: userId }, { $inc: increments });
};
