// Lògica de negoci del mòdul de documents
// Cap dependència d'Express — treballa únicament amb models i tipus

import type {
  DocumentSAAC,
  DocumentThumbnailPict,
  PictSequence,
} from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { DocumentModel, serializeDocument } from "./model";
import type { DocumentAsset } from "./model";
import type { CreateDocumentInput, UpdateDocumentInput } from "./validators";
import {
  assertImagesWithinSize,
  estimateIncomingBytes,
  deleteCloudinaryImages,
  extractPublicId,
  isCloudinaryUrl,
  sumBytes,
  uploadBase64Slots,
  userAssetFolder,
  type ImageSlot,
} from "../../shared/imageAssets";
import { applyUsageDelta, assertWithinQuota } from "../../shared/quota";
import { buildDocumentThumbnail } from "./thumbnail";

// Resum d'un document per al llistat — evita transferir content complet
export interface DocumentSummary {
  id: string;
  title?: string;
  updatedAt: Date;
  thumbnail: DocumentThumbnailPict[];
}

// Helper d'error semàntic
const documentError = (errorCode: string, statusCode: number): AppError => {
  const error = new Error(errorCode) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
};

const notFound = (): AppError => documentError("DOCUMENT_NOT_FOUND", 404);

// --- Helpers privats ---

// Ranures d'imatge d'un content de document (format Zod).
// Cada pictograma en té una: la lògica de Cloudinary no ha de saber com és un
// content, només com llegir i escriure la URL de cada imatge.
const contentImageSlots = (
  content: CreateDocumentInput["content"]
): ImageSlot[] =>
  Object.values(content)
    .flat()
    .map((pict) => ({
      url: pict.img.url,
      assign: (url: string) => {
        pict.img.url = url;
      },
    }));

// URLs de Cloudinary que té un content ja processat (format Zod)
const cloudinaryUrlsFromInput = (
  content: CreateDocumentInput["content"]
): string[] =>
  Object.values(content)
    .flat()
    .flatMap((pict) => (isCloudinaryUrl(pict.img.url) ? [pict.img.url as string] : []));

// URLs de Cloudinary d'un content ja desat (format Mongoose Map)
const cloudinaryUrlsFromMap = (content: Map<string, PictSequence[]>): string[] => {
  const urls: string[] = [];
  for (const sequences of content.values()) {
    for (const pict of sequences) {
      if (isCloudinaryUrl(pict.img.url)) {
        urls.push(pict.img.url as string);
      }
    }
  }
  return urls;
};

// --- Funcions públiques del service ---

// Retorna el llistat de documents de l'usuari (sense el content complet)
export const listDocuments = async (
  userId: string
): Promise<DocumentSummary[]> => {
  const docs = await DocumentModel.find({ userId })
    .select("title updatedAt thumbnail")
    .sort({ updatedAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    updatedAt: doc.updatedAt,
    // Els documents desats abans que existís el camp no en tenen cap
    thumbnail: doc.thumbnail ?? [],
  }));
};

// Crea un nou document associat a l'usuari
// Puja les imatges base64 a Cloudinary abans de persistir
export const createDocument = async (
  userId: string,
  input: CreateDocumentInput
): Promise<DocumentSAAC> => {
  const slots = contentImageSlots(input.content);
  assertImagesWithinSize(slots);
  await assertWithinQuota(userId, {
    incomingBytes: estimateIncomingBytes(slots),
    newDocument: true,
  });

  const uploaded = await uploadBase64Slots(userAssetFolder(userId), slots);
  const assets: DocumentAsset[] = uploaded.map(({ publicId, bytes }) => ({
    publicId,
    bytes,
  }));

  // La miniatura es deriva després de pujar les imatges: així mai hi entra un
  // base64 i les imatges pròpies hi van amb la URL definitiva de Cloudinary.
  const thumbnail = buildDocumentThumbnail(input.content, input.order);

  const doc = await DocumentModel.create({ userId, ...input, assets, thumbnail });

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

  const slots = contentImageSlots(input.content);
  assertImagesWithinSize(slots);
  await assertWithinQuota(userId, { incomingBytes: estimateIncomingBytes(slots) });

  // URLs de Cloudinary que tenia el document abans de l'actualització
  const oldCloudinaryUrls = cloudinaryUrlsFromMap(existing.content);

  // Puja les noves imatges base64 i substitueix in-place per URLs de Cloudinary
  const uploaded = await uploadBase64Slots(userAssetFolder(userId), slots);

  // URLs de Cloudinary que té el nou contingut (inclou les acabades de pujar)
  const newCloudinaryUrls = new Set(cloudinaryUrlsFromInput(input.content));

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

  const thumbnail = buildDocumentThumbnail(input.content, input.order);

  const updated = await DocumentModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...input,
        assets: [...remainingAssets, ...newAssets],
        thumbnail,
      },
    },
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
  const cloudinaryUrls = cloudinaryUrlsFromMap(doc.content);
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
