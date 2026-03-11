// Lògica de negoci del mòdul de documents
// Cap dependència d'Express — treballa únicament amb models i tipus

import type { DocumentSAAC } from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { DocumentModel, serializeDocument } from "./model";
import type { CreateDocumentInput, UpdateDocumentInput } from "./validators";

// Resum d'un document per al llistat — evita transferir content complet
export interface DocumentSummary {
  id: string;
  title?: string;
  updatedAt: Date;
}

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
export const createDocument = async (
  userId: string,
  input: CreateDocumentInput
): Promise<DocumentSAAC> => {
  console.log("[DOC][DB] createDocument - userId:", userId);
  console.log("[DOC][DB] createDocument - input keys:", Object.keys(input));
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

// Elimina un document — verifica ownership abans d'esborrar
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

  await doc.deleteOne();
};
