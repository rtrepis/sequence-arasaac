// Lògica de negoci del mòdul d'autenticació
// Cap dependència d'Express — treballa únicament amb models i JWT

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { LangsApp } from "@sequence-arasaac/shared-types";
import { env } from "../../config/env";
import { toLangsApp } from "../../shared/langsApp";
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
import {
  getAppConfig,
  countSignupsToday,
  recordSignupToday,
} from "../config/service";
import {
  recordSecurityEvent,
  countRecentEventsForUser,
} from "../security/service";
import { recordClientError } from "../client-errors/service";
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

// Verificació del correu (signup) i recuperació de contrasenya (forgot-password).
// El de recuperació és més curt: una recuperació no reclamada de seguida ha de
// caducar aviat. En mil·lisegons i en un sol lloc perquè el que caduca el token
// i el que se li diu a qui el rep no puguin divergir mai.
const PASSWORD_LINK_TTL_MS: Record<"verify" | "reset", number> = {
  verify: 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

// Excepció per als enllaços que genera l'administrador des del panell: aquell
// enllaç no el demana qui l'ha de fer servir. L'administrador el genera i l'ha
// de fer arribar per un altre canal (un missatge, una trucada, en persona), i
// entremig hi poden passar hores; l'hora que dura una recuperació val quan qui
// la demana té la pantalla oberta esperant-la, i aquí no és el cas. Val un dia,
// com el de primer accés, que és el que ja rebia la meitat dels casos.
export const ADMIN_PASSWORD_LINK_TTL_MS = 24 * 60 * 60 * 1000;
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

// Enllaç a /set-password amb el seu token, i quan caduca.
//
// És l'única manera de construir-lo a tot el mòdul: el token dona accés a
// establir la contrasenya d'un compte, i tenir-ne dues receptes vol dir que
// un dia una de les dues caducarà diferent de l'altra sense que ho digui res.
export interface PasswordLink {
  url: string;
  type: "verify" | "reset";
  expiresAt: string;
}

// Qui el construeix pot posar-hi una durada pròpia (`ttlMs`), i aleshores mana
// per damunt de la del tipus. És un argument i no una recepta a part perquè el
// que caduca el token i el que se li diu a qui el rep continuïn sortint del
// mateix número: tenir-los per separat és la divergència que això evita.
export const createPasswordLink = (
  userId: string,
  type: "verify" | "reset",
  ttlMs: number = PASSWORD_LINK_TTL_MS[type]
): PasswordLink => {
  const token = jwt.sign({ userId, type } as PasswordTokenPayload, env.JWT_SECRET, {
    expiresIn: ttlMs / 1000,
  });

  return {
    url: `${env.APP_PUBLIC_URL}/set-password?token=${token}`,
    type,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
};

// Construeix l'enllaç d'establiment de contrasenya i l'envia. No llança mai.
// Retorna si el correu ha sortit, perquè qui truca pugui continuar igualment.
const deliverPasswordEmail = async (
  userId: string,
  email: string,
  name: string | undefined,
  type: "verify" | "reset",
  ipHash: string,
  locale: LangsApp
): Promise<boolean> => {
  const { url } = createPasswordLink(userId, type);
  const { sent, reason } =
    type === "verify"
      ? await sendVerificationEmail(email, name, url, locale)
      : await sendPasswordResetEmail(email, url, locale);

  if (sent) {
    await recordSecurityEvent({
      type: type === "verify" ? "verify_sent" : "reset_requested",
      ipHash,
      userId,
    });
  } else {
    // Un correu que no surt és una fallada que arriba a l'usuari, i de les
    // pitjors: sense l'enllaç, un compte acabat de crear no té contrasenya i
    // no s'hi pot entrar mai. Va al mateix registre que la resta d'errors
    // vistos —panell d'administració i avís— perquè no depengui de si algú
    // mirava els registres del servidor en aquell moment.
    await recordClientError({
      code: "MAIL_SEND_FAILED",
      context: type === "verify" ? "signup-verification" : "password-reset",
      detail: reason,
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

  // Fre diari: encara que hi hagi lloc de sobra al sostre global, no entra més
  // gent de la que es pot atendre en un dia. Es comprova aquí i no al rate
  // limiter perquè aquell és per IP —una allau des de mil connexions diferents
  // se li escaparia— i perquè el que s'està limitant és quants comptes es
  // creen, no quantes peticions arriben.
  const signupsToday = await countSignupsToday();
  if (signupsToday >= config.maxDailySignups) {
    throw authError("DAILY_SIGNUP_LIMIT_REACHED", 403);
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
    .select("_id email name status langSettings")
    .lean();

  if (existing) {
    const existingId = String(existing._id);
    if (existing.status !== "suspended" && (await canSendResetLinkEmail(existingId))) {
      const { url: resetUrl } = createPasswordLink(existingId, "reset");
      // Compte ja existent: el correu va en el seu idioma desat, no en el de qui
      // ara prova de registrar-se amb la mateixa adreça (pot no ser la mateixa persona).
      const { sent, reason } = await sendAccountExistsEmail(
        existing.email,
        existing.name,
        resetUrl,
        existing.langSettings?.app
      );
      if (sent) {
        await recordSecurityEvent({
          type: "reset_requested",
          ipHash,
          userId: existingId,
        });
      } else {
        await recordClientError({
          code: "MAIL_SEND_FAILED",
          context: "signup-account-exists",
          detail: reason,
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

  // El comptador puja només amb un usuari creat de debò: un correu que ja té
  // compte no gasta plaça del dia, perquè no n'ha ocupat cap.
  await recordSignupToday();

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
    ipHash,
    // Encara no hi ha langSettings pròpia: és l'únic moment en què l'idioma
    // del correu ve de la petició, no del compte. toLangsApp normalitza
    // qualsevol valor desconegut cap al català, sense bloquejar el registre.
    toLangsApp(input.locale)
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
    .select("email name status langSettings")
    .lean();

  // Compte inexistent o suspès: sortir en silenci és la resposta correcta.
  if (!user || user.status === "suspended") {
    return;
  }

  const userId = String(user._id);
  if (!(await canSendResetLinkEmail(userId))) {
    return;
  }

  await deliverPasswordEmail(
    userId,
    user.email,
    user.name,
    "reset",
    ipHash,
    user.langSettings?.app ?? "ca"
  );
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
    .select("email name emailVerified langSettings")
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

  await deliverPasswordEmail(
    userId,
    user.email,
    user.name,
    "verify",
    ipHash,
    user.langSettings?.app ?? "ca"
  );
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
