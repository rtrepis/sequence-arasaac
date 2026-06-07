// Handlers Express per al mòdul de user-settings
import { Request, Response, NextFunction } from "express";
import { updateUiSettingsSchema } from "./validators";
import { getUiSettings as getUiSettingsService, updateUiSettings as updateUiSettingsService } from "./service";
import type { AppError } from "../../middleware/errorHandler";

// GET /api/user/ui-settings
export const getUiSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getUiSettingsService(req.userId as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/ui-settings
export const updateUiSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateUiSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    await updateUiSettingsService(req.userId as string, parsed.data);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
};
