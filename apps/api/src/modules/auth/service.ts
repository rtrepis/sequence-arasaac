// Lògica de negoci del mòdul d'autenticació
// Cap dependència d'Express — treballa únicament amb models i JWT

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "./model";
import type { IUser } from "./model";
import type { RegisterInput, LoginInput } from "./validators";
import type { AppError } from "../../middleware/errorHandler";
import { toCanonicalEmail } from "../../shared/emailCanonical";
import { isDisposableEmail } from "../../shared/disposableDomains";
import { getAppConfig } from "../config/service";
import {
  recordSecurityEvent,
  countRecentEventsForUser,
} from "../security/service";
import { sendVerificationEmail } from "../../shared/mailer";

// Durades dels tokens
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

// Bloqueig del compte per intents de login fallits
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// Verificació del correu
const VERIFICATION_TOKEN_EXPIRES_IN = "24h";
// Límits de reenviament, per no cremar la quota diària del proveïdor de correu
const RESEND_MIN_INTERVAL_MS = 5 * 60 * 1000;
const RESEND_MAX_PER_DAY = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Estructura retornada per register i login
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// El registre informa a més de si el correu de verificació ha pogut sortir:
// el front ho necessita per triar entre "revisa la safata" i "torna-ho a provar"
export interface RegisterResult extends AuthTokens {
  verificationEmailSent: boolean;
}

// Payload del token de verificació de correu
interface VerifyTokenPayload {
  userId: string;
  type: "verify";
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
  tokenVersion: number;
}

// Helper d'error semàntic — tots els errors del mòdul segueixen aquest format
const authError = (errorCode: string, statusCode: number): AppError => {
  const error = new Error(errorCode) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
};

// Genera el parell de tokens per a un usuari donat
export const generateTokens = (
  userId: string,
  email: string,
  tokenVersion: number
): AuthTokens => {
  const accessTokenPayload: AccessTokenPayload = { userId, email };
  const refreshTokenPayload: RefreshTokenPayload = {
    userId,
    type: "refresh",
    tokenVersion,
  };

  const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(refreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

// Construeix l'enllaç de verificació i l'envia. No llança mai.
// Retorna si el correu ha sortit, perquè el registre pugui continuar igualment.
const deliverVerificationEmail = async (
  userId: string,
  email: string,
  ipHash: string
): Promise<boolean> => {
  const token = jwt.sign({ userId, type: "verify" } as VerifyTokenPayload, env.JWT_SECRET, {
    expiresIn: VERIFICATION_TOKEN_EXPIRES_IN,
  });

  const verificationUrl = `${env.APP_PUBLIC_URL}/verify-email?token=${token}`;
  const sent = await sendVerificationEmail(email, verificationUrl);

  if (sent) {
    await recordSecurityEvent({ type: "verify_sent", ipHash, userId });
  }

  return sent;
};

// Registra un nou usuari — llança AppError si la bústia ja té compte.
// ipHash arriba pseudonimitzat des del controller: aquesta capa mai veu una IP.
export const registerUser = async (
  input: RegisterInput,
  ipHash: string
): Promise<RegisterResult> => {
  const emailCanonical = toCanonicalEmail(input.email);

  // Les comprovacions van de la més barata a la més cara, i les que revelen
  // menys informació primer: cap d'elles ha de dir a un desconegut quins
  // correus hi ha registrats abans d'haver descartat que el registre estigui tancat.
  const config = await getAppConfig();

  if (!config.registrationOpen) {
    throw authError("REGISTRATION_CLOSED", 403);
  }

  // countDocuments i no estimatedDocumentCount: aquest sostre ha de ser exacte,
  // i amb els volums d'aquesta app el cost de comptar és irrellevant
  const userCount = await UserModel.countDocuments();
  if (userCount >= config.maxUsers) {
    throw authError("MAX_USERS_REACHED", 403);
  }

  if (isDisposableEmail(emailCanonical)) {
    throw authError("DISPOSABLE_EMAIL", 400);
  }

  // La comprovació és sobre la forma canònica, no sobre l'email literal:
  // altrament, els alias de "+" i els punts de Gmail donarien comptes il·limitats
  const existing = await UserModel.findOne({ emailCanonical }).select("_id").lean();
  if (existing) {
    throw authError("EMAIL_ALREADY_EXISTS", 409);
  }

  // Hash de la contrasenya — 12 rounds és el mínim recomanat per a producció
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await UserModel.create({
    email: input.email,
    emailCanonical,
    passwordHash,
    // settings, langSettings, status i usage prenen els valors per defecte del model
  });

  await recordSecurityEvent({
    type: "register",
    ipHash,
    emailCanonical,
    userId: user._id as typeof user._id,
  });

  // L'enviament no bloqueja el registre: si el proveïdor falla o s'ha esgotat
  // la quota diària, el compte ja existeix i l'usuari pot demanar el reenviament.
  // Un dia dolent del correu no pot deixar el registre trencat.
  const verificationEmailSent = await deliverVerificationEmail(
    String(user._id),
    user.email,
    ipHash
  );

  return {
    ...generateTokens(String(user._id), user.email, user.tokenVersion),
    verificationEmailSent,
  };
};

// Marca el correu com a verificat a partir del token de l'enllaç.
// Idempotent: tornar a clicar un enllaç ja usat no és cap error per a l'usuari.
export const verifyEmail = async (token: string): Promise<void> => {
  let payload: VerifyTokenPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as VerifyTokenPayload;
  } catch {
    throw authError("VERIFICATION_TOKEN_INVALID", 400);
  }

  if (payload.type !== "verify") {
    throw authError("VERIFICATION_TOKEN_INVALID", 400);
  }

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw authError("USER_NOT_FOUND", 404);
  }

  if (user.emailVerified) {
    return;
  }

  user.emailVerified = true;
  // Un compte suspès no es reactiva per verificar el correu: la suspensió mana
  if (user.status === "pending") {
    user.status = "active";
  }
  await user.save();

  await recordSecurityEvent({
    type: "verify_completed",
    ipHash: "unknown",
    emailCanonical: user.emailCanonical,
    userId: user._id as typeof user._id,
  });
};

// Reenvia el correu de verificació a un usuari autenticat.
// Els límits eviten que un sol compte cremi la quota diària del proveïdor.
export const resendVerification = async (
  userId: string,
  ipHash: string
): Promise<void> => {
  const user = await UserModel.findById(userId).select("email emailVerified").lean();

  if (!user) {
    throw authError("USER_NOT_FOUND", 404);
  }

  if (user.emailVerified) {
    throw authError("EMAIL_ALREADY_VERIFIED", 409);
  }

  const sentLastDay = await countRecentEventsForUser("verify_sent", userId, ONE_DAY_MS);
  if (sentLastDay >= RESEND_MAX_PER_DAY) {
    throw authError("VERIFICATION_RESEND_LIMIT", 429);
  }

  const sentRecently = await countRecentEventsForUser(
    "verify_sent",
    userId,
    RESEND_MIN_INTERVAL_MS
  );
  if (sentRecently > 0) {
    throw authError("VERIFICATION_RESEND_TOO_SOON", 429);
  }

  const sent = await deliverVerificationEmail(userId, user.email, ipHash);
  if (!sent) {
    throw authError("VERIFICATION_EMAIL_FAILED", 502);
  }
};

// Autentica un usuari existent — missatge genèric per no revelar si l'email existeix o no
export const loginUser = async (
  input: LoginInput,
  ipHash: string
): Promise<AuthTokens> => {
  const emailCanonical = toCanonicalEmail(input.email);
  const user: IUser | null = await UserModel.findOne({ emailCanonical });

  // Codi genèric intencionat — no revela si l'email existeix o no
  const invalidError = authError("INVALID_CREDENTIALS", 401);

  if (!user) {
    // Hash fictici per evitar timing attacks (bcrypt.compare és lent)
    // Sense això, un atacant podria enumerar emails per la diferència de temps
    await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    throw invalidError;
  }

  if (user.status === "suspended") {
    throw authError("ACCOUNT_SUSPENDED", 403);
  }

  // Compte bloquejat per intents fallits: es retorna el mateix error genèric.
  // Dir "aquest compte està bloquejat" confirmaria a un atacant que l'email existeix;
  // per això el bloqueig és curt (15 min) i no es comunica de manera diferenciada.
  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    throw invalidError;
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValid) {
    user.failedLoginAttempts += 1;
    const isNowLocked = user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

    if (isNowLocked) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();

    await recordSecurityEvent({
      type: isNowLocked ? "account_locked" : "login_failed",
      ipHash,
      emailCanonical,
      userId: user._id as typeof user._id,
    });

    throw invalidError;
  }

  // Login correcte: es neteja tot rastre d'intents anteriors
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  return generateTokens(String(user._id), user.email, user.tokenVersion);
};

// Verifica un refresh token i retorna un nou parell de tokens
// És l'únic punt que consulta la BD a cada renovació: aquí es fa efectiva la suspensió
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    // Verificar que és realment un refresh token (no un access token reutilitzat)
    if (payload.type !== "refresh") {
      throw authError("INVALID_REFRESH_TOKEN", 401);
    }

    const user = await UserModel.findById(payload.userId)
      .select("email tokenVersion status")
      .lean();

    if (!user) {
      throw authError("USER_NOT_FOUND", 401);
    }

    if (user.status === "suspended") {
      throw authError("ACCOUNT_SUSPENDED", 403);
    }

    // Els tokens emesos abans d'existir tokenVersion no en porten: es tracten com a versió 0,
    // que és la dels usuaris que mai han estat invalidats. Així el desplegament no tanca cap sessió.
    if ((payload.tokenVersion ?? 0) !== user.tokenVersion) {
      throw authError("INVALID_REFRESH_TOKEN", 401);
    }

    return generateTokens(payload.userId, user.email, user.tokenVersion);
  } catch (err) {
    // Si ja és un AppError amb errorCode, el relancem directament
    if ((err as AppError).errorCode) {
      throw err;
    }
    throw authError("REFRESH_TOKEN_EXPIRED", 401);
  }
};
