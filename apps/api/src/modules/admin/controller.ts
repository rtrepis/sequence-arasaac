// Handlers Express del mòdul d'administració
// Delega tota la lògica al service — el controller només gestiona req/res

import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import type { AppError } from "../../middleware/errorHandler";
import {
  listUsersQuerySchema,
  updateUserSchema,
  listEventsQuerySchema,
  deleteClientErrorsQuerySchema,
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
import {
  listClientErrors,
  deleteClientError as deleteClientErrorService,
  deleteClientErrorsBefore,
} from "../client-errors/service";
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

// DELETE /api/admin/client-errors/:id
// Treu del registre un error ja mirat, perquè el que hi queda sigui el que
// encara demana atenció.
//
// A diferència del buidat, no deixa SecurityEvent: descartar files d'una a una
// és el gest normal de la pantalla, i registrar-lo ompliria la traça de
// seguretat de soroll amb el mateix pes que el que s'acaba d'esborrar
export const deleteClientError = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return next(invalidData());
    }

    const deleted = await deleteClientErrorService(req.params.id);

    if (!deleted) {
      const error = new Error("CLIENT_ERROR_NOT_FOUND") as AppError;
      error.statusCode = 404;
      error.errorCode = "CLIENT_ERROR_NOT_FOUND";
      return next(error);
    }

    res.status(200).json({ deleted: 1 });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/client-errors?before=<ISO>
// Buida el registre fins al moment que digui la petició
export const deleteClientErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = deleteClientErrorsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(invalidData());
    }

    const deleted = await deleteClientErrorsBefore(parsed.data.before);

    // Com la resta d'accions d'administració, queda registrat: és l'única
    // manera de saber després que aquells errors van existir
    await recordSecurityEvent({
      type: "admin_action",
      ipHash: hashIp(req.ip),
      detail: `client-errors:delete ${deleted} fins a ${parsed.data.before.toISOString()}`,
    });

    res.status(200).json({ deleted });
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
