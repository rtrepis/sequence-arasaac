// Lògica de negoci del mòdul de documents
// Cap dependència d'Express — treballa únicament amb models i tipus

import type { DocumentSAAC, PictSequence } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { DocumentModel, serializeDocument } from "./model";
import type { DocumentAsset } from "./model";
import type { CreateDocumentInput, UpdateDocumentInput } from "./validators";
import { cloudinary } from "../../shared/cloudinaryClient";
import { UserModel } from "../auth/model";
import { resolveQuotaLimits } from "../../shared/tierLimits";

// Resum d'un document per al llistat — evita transferir content complet
export interface DocumentSummary {
  id: string;
  title?: string;
  updatedAt: Date;
}

// Imatge acabada de pujar: la URL serveix per substituir-la al content,
// publicId i bytes per al recompte de consum
interface UploadedAsset extends DocumentAsset {
  url: string;
}

// Helper d'error semàntic
const documentError = (errorCode: string, statusCode: number): AppError => {
  const error = new Error(errorCode) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
};

const notFound = (): AppError => documentError("DOCUMENT_NOT_FOUND", 404);

// --- Helpers privats per a la gestió d'imatges amb Cloudinary ---

// Extreu el public_id de Cloudinary a partir de la URL segura
// Exemple: "https://res.cloudinary.com/cloud/image/upload/v123/seq/abc.jpg" → "seq/abc"
const extractPublicId = (url: string): string => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match?.[1] ?? "";
};

// Extreu totes les URLs de Cloudinary d'un content de document (format Zod)
const extractCloudinaryUrlsFromInput = (
  content: CreateDocumentInput["content"]
): string[] => {
  return Object.values(content)
    .flat()
    .flatMap((pict) =>
      pict.img.url?.startsWith("https://res.cloudinary.com/") ? [pict.img.url] : []
    );
};

// Extreu totes les URLs de Cloudinary d'un content de document (format Mongoose Map)
const extractCloudinaryUrlsFromMap = (
  content: Map<string, PictSequence[]>
): string[] => {
  const urls: string[] = [];
  for (const sequences of content.values()) {
    for (const pict of sequences) {
      if (pict.img.url?.startsWith("https://res.cloudinary.com/")) {
        urls.push(pict.img.url);
      }
    }
  }
  return urls;
};

// Pes aproximat de les imatges base64 que porta un content, abans de pujar-les.
// Una cadena base64 ocupa 4 caràcters per cada 3 bytes de dades originals.
// Serveix per rebutjar una petició que excedirà la quota SENSE haver pujat res:
// pujar primer i rebutjar després deixaria imatges orfes ja pagades a Cloudinary.
const estimateIncomingBytes = (content: CreateDocumentInput["content"]): number => {
  let total = 0;
  for (const sequences of Object.values(content)) {
    for (const pict of sequences) {
      const url = pict.img.url;
      if (url?.startsWith("data:image/")) {
        const base64Length = url.length - url.indexOf(",") - 1;
        total += Math.floor((base64Length * 3) / 4);
      }
    }
  }
  return total;
};

// Recorre el content, puja cada data:image/ a Cloudinary i substitueix la URL in-place.
// Modifica l'estructura de l'input directament (ja és una còpia validada per Zod)
// i retorna les imatges pujades per poder-ne comptar el pes real.
const extractAndUploadBase64Images = async (
  userId: string,
  content: CreateDocumentInput["content"]
): Promise<UploadedAsset[]> => {
  const uploaded: UploadedAsset[] = [];

  for (const sequences of Object.values(content)) {
    for (const pict of sequences) {
      if (pict.img.url?.startsWith("data:image/")) {
        const result = await cloudinary.uploader.upload(pict.img.url, {
          folder: `seq/${userId}`,
          resource_type: "image",
        });
        pict.img.url = result.secure_url;
        uploaded.push({
          publicId: result.public_id,
          bytes: result.bytes,
          url: result.secure_url,
        });
      }
    }
  }

  return uploaded;
};

// Elimina un conjunt d'URLs de Cloudinary — no falla si alguna ja no existeix
const deleteCloudinaryImages = async (urls: string[]): Promise<void> => {
  for (const url of urls) {
    const publicId = extractPublicId(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }
};

// --- Helpers de quota i consum ---

// Comprova que l'usuari pot crear un document més i pujar els bytes que porta.
// Es crida SEMPRE abans de tocar Cloudinary.
const assertWithinQuota = async (
  userId: string,
  incomingBytes: number,
  isNewDocument: boolean
): Promise<void> => {
  const user = await UserModel.findById(userId)
    .select("tier quotaOverride usage")
    .lean();

  if (!user) {
    throw documentError("USER_NOT_FOUND", 401);
  }

  const limits = resolveQuotaLimits(user.tier, user.quotaOverride);

  if (isNewDocument && user.usage.documentsCount >= limits.documents) {
    throw documentError("QUOTA_DOCUMENTS_EXCEEDED", 403);
  }

  if (user.usage.storageBytes + incomingBytes > limits.storageBytes) {
    throw documentError("QUOTA_STORAGE_EXCEEDED", 403);
  }
};

// Aplica una variació als comptadors de consum de l'usuari.
// $inc en una sola operació: el comptador i el recurs canvien alhora.
const applyUsageDelta = async (
  userId: string,
  delta: { documents?: number; storageBytes?: number; assets?: number }
): Promise<void> => {
  const increments: Record<string, number> = {};

  if (delta.documents) increments["usage.documentsCount"] = delta.documents;
  if (delta.storageBytes) increments["usage.storageBytes"] = delta.storageBytes;
  if (delta.assets) increments["usage.assetsCount"] = delta.assets;

  if (Object.keys(increments).length === 0) {
    return;
  }

  await UserModel.updateOne({ _id: userId }, { $inc: increments });
};

// Suma els bytes d'un conjunt d'imatges
const sumBytes = (assets: DocumentAsset[]): number =>
  assets.reduce((total, asset) => total + asset.bytes, 0);

// --- Funcions públiques del service ---

// Retorna el llistat de documents de l'usuari (sense el content complet)
export const listDocuments = async (
  userId: string
): Promise<DocumentSummary[]> => {
  const docs = await DocumentModel.find({ userId })
    .select("title updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    updatedAt: doc.updatedAt,
  }));
};

// Crea un nou document associat a l'usuari
// Puja les imatges base64 a Cloudinary abans de persistir
export const createDocument = async (
  userId: string,
  input: CreateDocumentInput
): Promise<DocumentSAAC> => {
  await assertWithinQuota(userId, estimateIncomingBytes(input.content), true);

  const uploaded = await extractAndUploadBase64Images(userId, input.content);
  const assets: DocumentAsset[] = uploaded.map(({ publicId, bytes }) => ({
    publicId,
    bytes,
  }));

  const doc = await DocumentModel.create({ userId, ...input, assets });

  await applyUsageDelta(userId, {
    documents: 1,
    storageBytes: sumBytes(assets),
    assets: assets.length,
  });

  return serializeDocument(doc);
};

// Retorna un document complet — verifica que pertany a l'usuari
export const getDocument = async (
  userId: string,
  id: string
): Promise<DocumentSAAC> => {
  const doc = await DocumentModel.findById(id);

  // Retornem 404 tant si no existeix com si pertany a un altre usuari
  // per no revelar l'existència del document a usuaris no autoritzats
  if (!doc || doc.userId.toString() !== userId) {
    throw notFound();
  }

  return serializeDocument(doc);
};

// Actualitza un document complet — substitució total del contingut
// Gestiona imatges: puja les noves base64 i elimina les de Cloudinary que ja no es fan servir
export const updateDocument = async (
  userId: string,
  id: string,
  input: UpdateDocumentInput
): Promise<DocumentSAAC> => {
  // Primer verifiquem ownership
  const existing = await DocumentModel.findById(id);
  if (!existing) {
    throw notFound();
  }
  if (existing.userId.toString() !== userId) {
    throw notFound();
  }

  await assertWithinQuota(userId, estimateIncomingBytes(input.content), false);

  // URLs de Cloudinary que tenia el document abans de l'actualització
  const oldCloudinaryUrls = extractCloudinaryUrlsFromMap(existing.content);

  // Puja les noves imatges base64 i substitueix in-place per URLs de Cloudinary
  const uploaded = await extractAndUploadBase64Images(userId, input.content);

  // URLs de Cloudinary que té el nou contingut (inclou les acabades de pujar)
  const newCloudinaryUrls = new Set(extractCloudinaryUrlsFromInput(input.content));

  // Imatges orfes = estaven a l'anterior però no apareixen al nou contingut
  const orphanUrls = oldCloudinaryUrls.filter((url) => !newCloudinaryUrls.has(url));
  await deleteCloudinaryImages(orphanUrls);

  // El pes de les orfes surt del registre d'assets del document.
  // Les que hi eren abans d'existir aquest camp compten com a zero: el seu pes
  // no es va arribar a registrar mai i inventar-lo seria pitjor que ignorar-lo.
  const orphanPublicIds = new Set(orphanUrls.map(extractPublicId));
  const orphanAssets = existing.assets.filter((asset) =>
    orphanPublicIds.has(asset.publicId)
  );

  const remainingAssets = existing.assets.filter(
    (asset) => !orphanPublicIds.has(asset.publicId)
  );
  const newAssets: DocumentAsset[] = uploaded.map(({ publicId, bytes }) => ({
    publicId,
    bytes,
  }));

  const updated = await DocumentModel.findByIdAndUpdate(
    id,
    { $set: { ...input, assets: [...remainingAssets, ...newAssets] } },
    { new: true, runValidators: true }
  );

  // No hauria d'arribar aquí, però TypeScript ho requereix
  if (!updated) {
    throw notFound();
  }

  await applyUsageDelta(userId, {
    storageBytes: sumBytes(newAssets) - sumBytes(orphanAssets),
    assets: newAssets.length - orphanAssets.length,
  });

  return serializeDocument(updated);
};

// Elimina un document — verifica ownership i neteja les imatges de Cloudinary associades
export const deleteDocument = async (
  userId: string,
  id: string
): Promise<void> => {
  const doc = await DocumentModel.findById(id);

  if (!doc || doc.userId.toString() !== userId) {
    throw notFound();
  }

  // Eliminar imatges de Cloudinary associades al document
  const cloudinaryUrls = extractCloudinaryUrlsFromMap(doc.content);
  await deleteCloudinaryImages(cloudinaryUrls);

  const freedBytes = sumBytes(doc.assets);
  const freedAssets = doc.assets.length;

  await doc.deleteOne();

  await applyUsageDelta(userId, {
    documents: -1,
    storageBytes: -freedBytes,
    assets: -freedAssets,
  });
};
