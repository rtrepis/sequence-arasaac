// Handlers Express per al mòdul d'autenticació
// Delega tota la lògica al service — el controller només gestiona req/res

import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./validators";
import { registerUser, loginUser, refreshTokens } from "./service";
import type { AppError } from "../../middleware/errorHandler";

// Durada de la cookie de refresh token en mil·lisegons (7 dies)
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Nom de la cookie del refresh token — constant per evitar typos
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

// Helper privat per configurar la cookie httpOnly del refresh token
const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    // En producció requereix HTTPS; en dev funciona sense
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

// POST /api/auth/register
// Crea un nou usuari i retorna un access token + cookie de refresh
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    const { accessToken, refreshToken } = await registerUser(parsed.data);

    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
// Autentica un usuari i retorna un access token + cookie de refresh
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(
        parsed.error.errors[0]?.message ?? "Dades invàlides"
      ) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    const { accessToken, refreshToken } = await loginUser(parsed.data);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
// Llegeix la cookie de refresh token i retorna un nou parell de tokens
export const refresh = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token: string | undefined =
      req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

    if (!token) {
      const error = new Error("Token de refresc no trobat") as AppError;
      error.statusCode = 401;
      return next(error);
    }

    const { accessToken, refreshToken } = refreshTokens(token);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
// Esborra la cookie de refresh token — el client ha d'eliminar l'access token localment
export const logout = (_req: Request, res: Response): void => {
  // Cal les mateixes opcions que quan es va crear per garantir l'eliminació correcta
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(204).send();
};
