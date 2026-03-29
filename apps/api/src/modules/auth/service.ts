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
}

// Payload del JWT de refresh — camp type per prevenir reutilització d'access tokens
interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

// Genera el parell de tokens per a un userId donat
export const generateTokens = (userId: string): AuthTokens => {
  const accessTokenPayload: AccessTokenPayload = { userId };
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
    const error = new Error(
      "Aquest correu electrònic ja està registrat"
    ) as AppError;
    error.statusCode = 409;
    throw error;
  }

  // Hash de la contrasenya — 12 rounds és el mínim recomanat per a producció
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await UserModel.create({
    email: input.email,
    passwordHash,
    // settings i langSettings prenen els valors per defecte definits al model
  });

  return generateTokens(String(user._id));
};

// Autentica un usuari existent — missatge genèric per no revelar si l'email existeix o no
export const loginUser = async (input: LoginInput): Promise<AuthTokens> => {
  const user: IUser | null = await UserModel.findOne({ email: input.email });

  // Missatge genèric intencionat — no revela si l'email existeix
  const invalidError = new Error("Credencials incorrectes") as AppError;
  invalidError.statusCode = 401;

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

  return generateTokens(String(user._id));
};

// Verifica un refresh token i retorna un nou parell de tokens
// Funció síncrona — jwt.verify és sincronic, no cal accedir a la BD
export const refreshTokens = (refreshToken: string): AuthTokens => {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    // Verificar que és realment un refresh token (no un access token reutilitzat)
    if (payload.type !== "refresh") {
      const error = new Error("Token de refresc invàlid") as AppError;
      error.statusCode = 401;
      throw error;
    }

    return generateTokens(payload.userId);
  } catch (err) {
    // Si ja és un AppError amb statusCode, el relancem directament
    if ((err as AppError).statusCode) {
      throw err;
    }
    const error = new Error("Token de refresc invàlid o caducat") as AppError;
    error.statusCode = 401;
    throw error;
  }
};
