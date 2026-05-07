// Lògica de negoci del mòdul d'autenticació
// Cap dependència d'Express — treballa únicament amb models i JWT

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "./model";
import type { IUser } from "./model";
import type { RegisterInput, LoginInput } from "./validators";
import type { AppError } from "../../middleware/errorHandler";

// Durades dels tokens
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

// Estructura retornada per register i login
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Payload del JWT d'accés — ha de coincidir amb JwtPayload d'authMiddleware
interface AccessTokenPayload {
  userId: string;
  email: string;
}

// Payload del JWT de refresh — camp type per prevenir reutilització d'access tokens
interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

// Genera el parell de tokens per a un userId i email donats
export const generateTokens = (userId: string, email: string): AuthTokens => {
  const accessTokenPayload: AccessTokenPayload = { userId, email };
  const refreshTokenPayload: RefreshTokenPayload = { userId, type: "refresh" };

  const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(refreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

// Registra un nou usuari — llança AppError si el correu ja existeix
export const registerUser = async (
  input: RegisterInput
): Promise<AuthTokens> => {
  // Comprovar si ja existeix un usuari amb aquest email
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    const error = new Error("EMAIL_ALREADY_EXISTS") as AppError;
    error.statusCode = 409;
    error.errorCode = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  // Hash de la contrasenya — 12 rounds és el mínim recomanat per a producció
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await UserModel.create({
    email: input.email,
    passwordHash,
    // settings i langSettings prenen els valors per defecte definits al model
  });

  return generateTokens(String(user._id), user.email);
};

// Autentica un usuari existent — missatge genèric per no revelar si l'email existeix o no
export const loginUser = async (input: LoginInput): Promise<AuthTokens> => {
  const user: IUser | null = await UserModel.findOne({ email: input.email });

  // Codi genèric intencionat — no revela si l'email existeix o no
  const invalidError = new Error("INVALID_CREDENTIALS") as AppError;
  invalidError.statusCode = 401;
  invalidError.errorCode = "INVALID_CREDENTIALS";

  if (!user) {
    // Hash fictici per evitar timing attacks (bcrypt.compare és lent)
    // Sense això, un atacant podria enumerar emails per la diferència de temps
    await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    throw invalidError;
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw invalidError;
  }

  return generateTokens(String(user._id), user.email);
};

// Verifica un refresh token i retorna un nou parell de tokens
// Consulta la BD per incloure l'email al nou access token
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    // Verificar que és realment un refresh token (no un access token reutilitzat)
    if (payload.type !== "refresh") {
      const error = new Error("INVALID_REFRESH_TOKEN") as AppError;
      error.statusCode = 401;
      error.errorCode = "INVALID_REFRESH_TOKEN";
      throw error;
    }

    const user = await UserModel.findById(payload.userId).select("email").lean();
    if (!user) {
      const error = new Error("USER_NOT_FOUND") as AppError;
      error.statusCode = 401;
      error.errorCode = "USER_NOT_FOUND";
      throw error;
    }

    return generateTokens(payload.userId, user.email);
  } catch (err) {
    // Si ja és un AppError amb errorCode, el relancem directament
    if ((err as AppError).errorCode) {
      throw err;
    }
    const error = new Error("REFRESH_TOKEN_EXPIRED") as AppError;
    error.statusCode = 401;
    error.errorCode = "REFRESH_TOKEN_EXPIRED";
    throw error;
  }
};
