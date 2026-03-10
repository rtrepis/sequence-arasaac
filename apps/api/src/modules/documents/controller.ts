// Handlers Express per al mòdul de documents
// Delega tota la lògica al service — el controller només gestiona req/res

import { Request, Response, NextFunction } from "express";
import type { AppError } from "../../middleware/errorHandler";
import { createDocumentSchema, updateDocumentSchema } from "./validators";
import {
  listDocuments as listDocumentsService,
  createDocument as createDocumentService,
  getDocument as getDocumentService,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService,
} from "./service";

// Helper per verificar que l'usuari autenticat és present
// authMiddleware garanteix userId, però TypeScript ho requereix explícitament
const requireUserId = (
  req: Request,
  next: NextFunction
): string | null => {
  if (!req.userId) {
    const error = new Error("No autenticat") as AppError;
    error.statusCode = 401;
    next(error);
    return null;
  }
  return req.userId;
};

// GET /api/documents
// Retorna el llistat de documents de l'usuari (id, title, updatedAt)
export const listDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req, next);
    if (!userId) return;

    const documents = await listDocumentsService(userId);
    res.status(200).json({ documents });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents
// Crea un nou document i el retorna complet
export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req, next);
    if (!userId) return;

    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    const document = await createDocumentService(userId, parsed.data);
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id
// Retorna un document complet si pertany a l'usuari
export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req, next);
    if (!userId) return;

    const document = await getDocumentService(userId, req.params.id);
    res.status(200).json(document);
  } catch (err) {
    next(err);
  }
};

// PUT /api/documents/:id
// Actualitza un document complet i el retorna
export const updateDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req, next);
    if (!userId) return;

    const parsed = updateDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    const document = await updateDocumentService(userId, req.params.id, parsed.data);
    res.status(200).json(document);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/documents/:id
// Elimina un document — retorna 204 sense cos
export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req, next);
    if (!userId) return;

    await deleteDocumentService(userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
