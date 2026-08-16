// Handlers Express del mòdul d'administració
// Delega tota la lògica al service — el controller només gestiona req/res

import { Request, Response, NextFunction } from "express";
import type { AppError } from "../../middleware/errorHandler";
import {
  listUsersQuerySchema,
  updateUserSchema,
  listEventsQuerySchema,
  updateConfigSchema,
} from "./validators";
import {
  getStats,
  listUsers,
  updateUser,
  listSecurityEvents,
} from "./service";
import { getAppConfig, updateAppConfig } from "../config/service";
import { recordSecurityEvent } from "../security/service";
import { listClientErrors } from "../client-errors/service";
import { hashIp } from "../../shared/ipHash";

// Prou per veure què està passant aquests dies sense paginar una pantalla
// que es consulta quan alguna cosa ha anat malament
const CLIENT_ERRORS_LIMIT = 50;

// Error de validació amb el mateix format que la resta de mòduls
const invalidData = (message?: string): AppError => {
  const errorCode = message ?? "INVALID_DATA";
  const error = new Error(errorCode) as AppError;
  error.statusCode = 400;
  error.errorCode = errorCode;
  return error;
};

// GET /api/admin/stats
export const stats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json(await getStats());
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const users = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(invalidData());
    }

    res.status(200).json(await listUsers(parsed.data));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id
export const patchUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(invalidData());
    }

    const updated = await updateUser(req.params.id, parsed.data);

    // Tota acció d'administració queda registrada: si un dia cal explicar
    // per què es va suspendre un compte, la resposta ha d'existir en algun lloc
    await recordSecurityEvent({
      type: "admin_action",
      ipHash: hashIp(req.ip),
      emailCanonical: updated.email,
      userId: updated.id,
      detail: `update:${JSON.stringify(parsed.data).slice(0, 150)}`,
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/events
export const events = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = listEventsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(invalidData());
    }

    res.status(200).json(await listSecurityEvents(parsed.data));
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/client-errors
// Últims errors que han arribat a un usuari, del més recent al més antic
export const clientErrors = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({ errors: await listClientErrors(CLIENT_ERRORS_LIMIT) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/config
export const config = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json(await getAppConfig());
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/config — l'interruptor de registre i el sostre d'usuaris
export const putConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(invalidData());
    }

    const updated = await updateAppConfig(parsed.data);

    await recordSecurityEvent({
      type: "admin_action",
      ipHash: hashIp(req.ip),
      detail: `config:${JSON.stringify(parsed.data).slice(0, 150)}`,
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
