// Middleware d'autenticació JWT
// Verifica el token Bearer a la capçalera Authorization
// Afegeix userId a req per als handlers posteriors

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// Extensió global de la interfície Request d'Express per afegir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Payload esperat dins del JWT d'accés
interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ errorCode: "AUTH_TOKEN_MISSING" });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ errorCode: "AUTH_TOKEN_INVALID" });
  }
};
