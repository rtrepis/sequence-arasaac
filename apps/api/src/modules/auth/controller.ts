// Handlers Express per al mòdul d'autenticació
// Delega tota la lògica al service — el controller només gestiona req/res

import { Request, Response, NextFunction } from "express";
import {
  signupSchema,
  loginSchema,
  setPasswordSchema,
  forgotPasswordSchema,
  resendVerificationSchema,
} from "./validators";
import {
  signupUser,
  loginUser,
  refreshTokens,
  setPassword,
  requestPasswordReset,
  resendVerification,
} from "./service";
import { getRegistrationStatus } from "../config/service";
import type { AppError } from "../../middleware/errorHandler";
import { hashIp } from "../../shared/ipHash";

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

// Helper privat per respondre un 400 semàntic a partir del primer error de zod
const respondValidationError = (
  res: Response,
  next: NextFunction,
  parsed: { success: false; error: { errors: { message: string }[] } }
): void => {
  const errorCode = parsed.error.errors[0]?.message ?? "INVALID_DATA";
  const error = new Error(errorCode) as AppError;
  error.statusCode = 400;
  error.errorCode = errorCode;
  next(error);
};

// GET /api/auth/registration-status
// Públic i sense sessió: qui encara no té compte ha de poder saber si en pot
// crear un abans d'omplir el formulari. Només retorna recomptes i sostres.
export const registrationStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json(await getRegistrationStatus());
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signup
// Crea un usuari sense contrasenya i envia el correu de benvinguda+verificació.
// No hi ha sessió: la contrasenya (i el login automàtic) arriben a /set-password.
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return respondValidationError(res, next, parsed);

    // La IP es pseudonimitza aquí: cap capa per sota en veu una de real
    const { emailSent } = await signupUser(parsed.data, hashIp(req.ip));

    res.status(201).json({ emailSent });
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
    if (!parsed.success) return respondValidationError(res, next, parsed);

    const { accessToken, refreshToken } = await loginUser(
      parsed.data,
      hashIp(req.ip)
    );

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
// Llegeix la cookie de refresh token i retorna un nou parell de tokens
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token: string | undefined =
      req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

    if (!token) {
      const error = new Error("REFRESH_TOKEN_MISSING") as AppError;
      error.statusCode = 401;
      error.errorCode = "REFRESH_TOKEN_MISSING";
      return next(error);
    }

    const { accessToken, refreshToken } = await refreshTokens(token);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/set-password
// Estableix la contrasenya a partir del token de l'enllaç del correu (verificació
// inicial o recuperació) i fa login automàtic — mateixa resposta que /login.
export const setPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = setPasswordSchema.safeParse(req.body);
    if (!parsed.success) return respondValidationError(res, next, parsed);

    const { accessToken, refreshToken } = await setPassword(parsed.data);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
// Sempre respon 204, existeixi el compte o no: cap resposta diferenciada pot
// confirmar a qui la demana quins correus tenen compte.
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return respondValidationError(res, next, parsed);

    await requestPasswordReset(parsed.data.email, hashIp(req.ip));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-verification
// Sense sessió: un compte encara sense contrasenya no es pot autenticar per
// demanar-ho. Sempre respon 204, pel mateix motiu que /forgot-password.
export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) return respondValidationError(res, next, parsed);

    await resendVerification(parsed.data.email, hashIp(req.ip));
    res.status(204).send();
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
