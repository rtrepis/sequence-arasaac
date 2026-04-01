// Handler global d'errors Express
// Ha de tenir 4 paràmetres per ser reconegut com a error handler per Express

import { Request, Response, NextFunction } from "express";

// Interfície per a errors amb codi HTTP personalitzat i codi semàntic
export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
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

  res.status(statusCode).json({ errorCode });
};
