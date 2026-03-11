// Lògica de negoci del mòdul de documents
// Cap dependència d'Express — treballa únicament amb models i tipus

import type { DocumentSAAC, PictSequence } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { DocumentModel, serializeDocument } from "./model";
import type { CreateDocumentInput, UpdateDocumentInput } from "./validators";
import { cloudinary } from "../../shared/cloudinaryClient";

// Resum d'un document per al llistat — evita transferir content complet
export interface DocumentSummary {
  id: string;
  title?: string;
  updatedAt: Date;
}

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

// Recorre el content, puja cada data:image/ a Cloudinary i substitueix la URL in-place
// Modifica l'estructura de l'input directament (ja és una còpia validada per Zod)
const extractAndUploadBase64Images = async (
  userId: string,
  content: CreateDocumentInput["content"]
): Promise<void> => {
  for (const sequences of Object.values(content)) {
    for (const pict of sequences) {
      if (pict.img.url?.startsWith("data:image/")) {
        const result = await cloudinary.uploader.upload(pict.img.url, {
          folder: `seq/${userId}`,
          resource_type: "image",
        });
        pict.img.url = result.secure_url;
      }
    }
  }
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
  console.log("[DOC][DB] createDocument - userId:", userId);
  console.log("[DOC][DB] createDocument - input keys:", Object.keys(input));

  await extractAndUploadBase64Images(userId, input.content);

  const doc = await DocumentModel.create({ userId, ...input });
  console.log("[DOC][DB] createDocument - document creat a DB, id:", String(doc._id));
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
    const error = new Error("Document no trobat") as AppError;
    error.statusCode = 404;
    throw error;
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
  console.log("[DOC][DB] updateDocument - userId:", userId, "| id:", id);
  console.log("[DOC][DB] updateDocument - input keys:", Object.keys(input));

  // Primer verifiquem ownership
  const existing = await DocumentModel.findById(id);
  if (!existing) {
    console.log("[DOC][DB] updateDocument - document NO trobat a DB");
    const error = new Error("Document no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }
  if (existing.userId.toString() !== userId) {
    console.log("[DOC][DB] updateDocument - ownership KO: doc.userId =", existing.userId.toString(), "!= userId =", userId);
    const error = new Error("Document no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }
  console.log("[DOC][DB] updateDocument - ownership OK, actualitzant...");

  // URLs de Cloudinary que tenia el document abans de l'actualització
  const oldCloudinaryUrls = extractCloudinaryUrlsFromMap(existing.content);

  // Puja les noves imatges base64 i substitueix in-place per URLs de Cloudinary
  await extractAndUploadBase64Images(userId, input.content);

  // URLs de Cloudinary que té el nou contingut (inclou les acabades de pujar)
  const newCloudinaryUrls = new Set(extractCloudinaryUrlsFromInput(input.content));

  // Imatges orfes = estaven a l'anterior però no apareixen al nou contingut
  const orphanUrls = oldCloudinaryUrls.filter((url) => !newCloudinaryUrls.has(url));
  await deleteCloudinaryImages(orphanUrls);

  const updated = await DocumentModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true }
  );

  // No hauria d'arribar aquí, però TypeScript ho requereix
  if (!updated) {
    console.log("[DOC][DB] updateDocument - error: document desaparegut durant update");
    const error = new Error("Document no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }

  console.log("[DOC][DB] updateDocument - actualitzat correctament");
  return serializeDocument(updated);
};

// Elimina un document — verifica ownership i neteja les imatges de Cloudinary associades
export const deleteDocument = async (
  userId: string,
  id: string
): Promise<void> => {
  const doc = await DocumentModel.findById(id);

  if (!doc || doc.userId.toString() !== userId) {
    const error = new Error("Document no trobat") as AppError;
    error.statusCode = 404;
    throw error;
  }

  // Eliminar imatges de Cloudinary associades al document
  const cloudinaryUrls = extractCloudinaryUrlsFromMap(doc.content);
  await deleteCloudinaryImages(cloudinaryUrls);

  await doc.deleteOne();
};
