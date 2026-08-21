// Lògica de negoci del mòdul d'autenticació
// Cap dependència d'Express — treballa únicament amb models i JWT

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "./model";
import type { IUser } from "./model";
import type {
  SignupInput,
  LoginInput,
  SetPasswordInput,
} from "./validators";
import type { AppError } from "../../middleware/errorHandler";
import { toCanonicalEmail } from "../../shared/emailCanonical";
import { isDisposableEmail } from "../../shared/disposableDomains";
import { getAppConfig } from "../config/service";
import {
  recordSecurityEvent,
  countRecentEventsForUser,
} from "../security/service";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountExistsEmail,
} from "../../shared/mailer";

// Durades dels tokens
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

// Bloqueig del compte per intents de login fallits
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// Verificació del correu (signup) i recuperació de contrasenya (forgot-password)
const VERIFICATION_TOKEN_EXPIRES_IN = "24h";
// Més curt que el de verificació: una recuperació no reclamada de seguida ha de caducar aviat
const RESET_TOKEN_EXPIRES_IN = "1h";
// Límits de reenviament/petició, per no cremar la quota diària del proveïdor de correu
const RESEND_MIN_INTERVAL_MS = 5 * 60 * 1000;
const RESEND_MAX_PER_DAY = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Estructura retornada per login i setPassword
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// El signup informa de si el correu de benvinguda ha pogut sortir:
// el front ho necessita per triar entre "revisa la safata" i "torna-ho a provar"
export interface SignupResult {
  emailSent: boolean;
}

// Payload del token que arriba amb l'enllaç del correu. El mateix esquema serveix
// per als dos casos que acaben a /set-password — és el "type" qui distingeix
// establir la primera contrasenya (verify) de substituir-ne una d'existent (reset).
interface PasswordTokenPayload {
  userId: string;
  type: "verify" | "reset";
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

// Construeix l'enllaç d'establiment de contrasenya i l'envia. No llança mai.
// Retorna si el correu ha sortit, perquè qui truca pugui continuar igualment.
const deliverPasswordEmail = async (
  userId: string,
  email: string,
  name: string | undefined,
  type: "verify" | "reset",
  ipHash: string
): Promise<boolean> => {
  const token = jwt.sign({ userId, type } as PasswordTokenPayload, env.JWT_SECRET, {
    expiresIn: type === "verify" ? VERIFICATION_TOKEN_EXPIRES_IN : RESET_TOKEN_EXPIRES_IN,
  });

  const url = `${env.APP_PUBLIC_URL}/set-password?token=${token}`;
  const sent =
    type === "verify"
      ? await sendVerificationEmail(email, name, url)
      : await sendPasswordResetEmail(email, url);

  if (sent) {
    await recordSecurityEvent({
      type: type === "verify" ? "verify_sent" : "reset_requested",
      ipHash,
      userId,
    });
  }

  return sent;
};

// Llindar compartit per qualsevol correu que porti un enllaç d'establiment de
// contrasenya per a un compte ja existent (recuperació real o avís de signup
// duplicat): sense això, repetir la petició cremaria la quota diària del
// proveïdor o inundaria la bústia de qui ja té compte.
const canSendResetLinkEmail = async (userId: string): Promise<boolean> => {
  const requestedLastDay = await countRecentEventsForUser(
    "reset_requested",
    userId,
    ONE_DAY_MS
  );
  if (requestedLastDay >= RESEND_MAX_PER_DAY) return false;

  const requestedRecently = await countRecentEventsForUser(
    "reset_requested",
    userId,
    RESEND_MIN_INTERVAL_MS
  );
  return requestedRecently === 0;
};

// Registra un nou usuari sense contrasenya. La contrasenya s'estableix
// després, a /set-password, a partir de l'enllaç del correu.
// ipHash arriba pseudonimitzat des del controller: aquesta capa mai veu una IP.
export const signupUser = async (
  input: SignupInput,
  ipHash: string
): Promise<SignupResult> => {
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
  // altrament, els alias de "+" i els punts de Gmail donarien comptes il·limitats.
  //
  // Si ja existeix, NO ho diem: un "aquest correu ja existeix" permetria
  // enumerar comptes provant adreces a l'atzar (el mateix motiu pel qual
  // loginUser i requestPasswordReset ja donen sempre la mateixa resposta).
  // En comptes d'un error, s'envia un avís a la bústia real —que és qui ha de
  // saber-ho, no qui ha omplert el formulari— amb un enllaç per si l'ha
  // demanat perquè ha oblidat la contrasenya. El compte existent no es toca
  // en cap cas: cap canvi de contrasenya passa aquí, només al moment de
  // completar-lo a /set-password.
  const existing = await UserModel.findOne({ emailCanonical })
    .select("_id email name status")
    .lean();

  if (existing) {
    const existingId = String(existing._id);
    if (existing.status !== "suspended" && (await canSendResetLinkEmail(existingId))) {
      const token = jwt.sign(
        { userId: existingId, type: "reset" } as PasswordTokenPayload,
        env.JWT_SECRET,
        { expiresIn: RESET_TOKEN_EXPIRES_IN }
      );
      const resetUrl = `${env.APP_PUBLIC_URL}/set-password?token=${token}`;
      const sent = await sendAccountExistsEmail(existing.email, existing.name, resetUrl);
      if (sent) {
        await recordSecurityEvent({
          type: "reset_requested",
          ipHash,
          userId: existingId,
        });
      }
    }

    // Resposta idèntica a la d'un signup nou: qui ha omplert el formulari no
    // ha de poder distingir "ja hi ha compte" de "s'ha creat".
    return { emailSent: true };
  }

  const user = await UserModel.create({
    email: input.email,
    emailCanonical,
    name: input.name,
    useCase: input.useCase,
    useCaseOther: input.useCaseOther,
    // Sense passwordHash: el compte no pot fer login fins que es completi /set-password.
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
  const emailSent = await deliverPasswordEmail(
    String(user._id),
    user.email,
    user.name,
    "verify",
    ipHash
  );

  return { emailSent };
};

// Estableix la contrasenya a partir del token de l'enllaç rebut per correu.
// Serveix els dos casos que porten a /set-password: primera contrasenya (verify)
// i substitució per recuperació (reset) — és el "type" del token qui ho distingeix.
// Acaba com un login: retorna un parell de tokens perquè l'usuari entri de seguida.
export const setPassword = async (
  input: SetPasswordInput
): Promise<AuthTokens> => {
  let payload: PasswordTokenPayload;

  try {
    payload = jwt.verify(input.token, env.JWT_SECRET) as PasswordTokenPayload;
  } catch {
    throw authError("VERIFICATION_TOKEN_INVALID", 400);
  }

  if (payload.type !== "verify" && payload.type !== "reset") {
    throw authError("VERIFICATION_TOKEN_INVALID", 400);
  }

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw authError("USER_NOT_FOUND", 404);
  }

  user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  if (payload.type === "verify") {
    user.emailVerified = true;
    // Un compte suspès no es reactiva en establir la contrasenya: la suspensió mana
    if (user.status === "pending") {
      user.status = "active";
    }
  } else {
    // Reset: substituir la contrasenya tanca totes les sessions obertes amb
    // l'anterior, igual que fa la suspensió de comptes.
    user.tokenVersion += 1;
  }

  await user.save();

  await recordSecurityEvent({
    type: payload.type === "verify" ? "password_set" : "reset_completed",
    ipHash: "unknown",
    emailCanonical: user.emailCanonical,
    userId: user._id as typeof user._id,
  });

  return generateTokens(String(user._id), user.email, user.tokenVersion);
};

// Demana la recuperació de contrasenya. Mai llança i mai diu si l'email existeix:
// el controller respon sempre igual, existeixi el compte o no.
export const requestPasswordReset = async (
  email: string,
  ipHash: string
): Promise<void> => {
  const emailCanonical = toCanonicalEmail(email);
  const user = await UserModel.findOne({ emailCanonical })
    .select("email name status")
    .lean();

  // Compte inexistent o suspès: sortir en silenci és la resposta correcta.
  if (!user || user.status === "suspended") {
    return;
  }

  const userId = String(user._id);
  if (!(await canSendResetLinkEmail(userId))) {
    return;
  }

  await deliverPasswordEmail(userId, user.email, user.name, "reset", ipHash);
};

// Reenvia el correu de benvinguda+verificació. Ja no requereix sessió: un compte
// sense contrasenya encara no es pot autenticar per demanar-lo, i és per això que
// —igual que requestPasswordReset— mai llança ni distingeix casos de cara enfora:
// el controller respon sempre igual, tant si l'email existeix, ja està verificat
// o s'ha demanat massa cops, com si no. Sense sessió pel mig, qualsevol resposta
// diferenciada seria una via per confirmar quins correus tenen compte.
export const resendVerification = async (
  email: string,
  ipHash: string
): Promise<void> => {
  const emailCanonical = toCanonicalEmail(email);
  const user = await UserModel.findOne({ emailCanonical })
    .select("email name emailVerified")
    .lean();

  if (!user || user.emailVerified) {
    return;
  }

  const userId = String(user._id);

  const sentLastDay = await countRecentEventsForUser("verify_sent", userId, ONE_DAY_MS);
  if (sentLastDay >= RESEND_MAX_PER_DAY) {
    return;
  }

  const sentRecently = await countRecentEventsForUser(
    "verify_sent",
    userId,
    RESEND_MIN_INTERVAL_MS
  );
  if (sentRecently > 0) {
    return;
  }

  await deliverPasswordEmail(userId, user.email, user.name, "verify", ipHash);
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

  // Compte creat pel signup però encara sense contrasenya establerta (l'enllaç del
  // correu de benvinguda no s'ha fet servir encara): mateix error genèric, mateix
  // hash fictici — no hi ha cap contrasenya real amb què comparar.
  if (!user.passwordHash) {
    await bcrypt.hash(input.password, BCRYPT_ROUNDS);
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
