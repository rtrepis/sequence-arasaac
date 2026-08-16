// Handler del report d'errors del client

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { hashIp } from "../../shared/ipHash";
import { recordClientError } from "./service";

// Camps curts i tancats a propòsit: aquest endpoint és obert (un error pot passar
// sense sessió iniciada) i no ha de poder servir per escriure text lliure a la
// base de dades ni per endur-se dades de la pàgina.
const reportErrorSchema = z.object({
  code: z.string().min(1).max(60),
  context: z.string().min(1).max(60),
  detail: z.string().max(300).optional(),
});

// POST /api/client-errors
// Sempre respon 204: qui informa d'un error no ha de rebre'n un altre a canvi.
export const reportError = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const parsed = reportErrorSchema.safeParse(req.body);

  if (parsed.success) {
    await recordClientError({
      ...parsed.data,
      userAgent: req.get("user-agent")?.slice(0, 300),
      userId: req.userId,
      ipHash: hashIp(req.ip),
    });
  }

  res.status(204).send();
};
