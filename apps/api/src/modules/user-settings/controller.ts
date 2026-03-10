// Handlers Express per al mòdul de user-settings
// Delega tota la lògica al service — el controller només gestiona req/res

import { Request, Response, NextFunction } from "express";
import { updateSettingsSchema, updateLangSchema } from "./validators";
import {
  getSettings as getSettingsService,
  updateSettings as updateSettingsService,
  updateLang as updateLangService,
} from "./service";
import type { AppError } from "../../middleware/errorHandler";

// GET /api/user/settings
// Retorna els DefaultSettings i langSettings de l'usuari autenticat
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getSettingsService(req.userId as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/settings
// Actualitza els DefaultSettings de l'usuari
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    const result = await updateSettingsService(req.userId as string, parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/lang
// Actualitza els langSettings de l'usuari
export const updateLang = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateLangSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    const result = await updateLangService(req.userId as string, parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
