// Handler global d'errors Express
// Ha de tenir 4 paràmetres per ser reconegut com a error handler per Express

import { Request, Response, NextFunction } from "express";
import { hashIp } from "../shared/ipHash";
import { recordClientError } from "../modules/client-errors/service";

// Interfície per a errors amb codi HTTP personalitzat i codi semàntic
export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;

  // Els errors 500 en producció s'amaguen darrere un codi genèric
  const errorCode =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "INTERNAL_ERROR"
      : (err.errorCode ?? "UNKNOWN_ERROR");

  // Un 4xx és una resposta prevista (dades invàlides, sessió caducada) i no cal
  // sorollar-hi els registres. Un 5xx és un error del servidor i ha de deixar
  // rastre: amagar-lo al client és correcte, però amagar-lo també a qui manté
  // l'aplicació deixa el problema sense cap manera de trobar-lo.
  if (statusCode >= 500) {
    console.error(
      `[ERROR ${statusCode}] ${req.method} ${req.originalUrl} — ${err.message}`,
      err.stack
    );

    // Al mateix lloc que els errors del client: panell d'administració i, si
    // està configurat, correu. No s'espera: la resposta a l'usuari no depèn
    // que el registre arribi.
    void recordClientError({
      code: `SERVER_${err.errorCode ?? "EXCEPTION"}`,
      context: `${req.method} ${req.route?.path ?? req.path}`.slice(0, 60),
      detail: err.message?.slice(0, 300),
      userAgent: req.get("user-agent")?.slice(0, 300),
      userId: req.userId,
      ipHash: hashIp(req.ip),
    });
  }

  res.status(statusCode).json({ errorCode });
};
