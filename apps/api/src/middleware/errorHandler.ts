// Handler global d'errors Express
// Ha de tenir 4 paràmetres per ser reconegut com a error handler per Express

import { Request, Response, NextFunction } from "express";

// Interfície per a errors amb codi HTTP personalitzat
export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;

  // Ocultar detalls interns dels errors 500 a producció
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Error intern del servidor"
      : (err.message ?? "Error desconegut");

  res.status(statusCode).json({ message });
};
