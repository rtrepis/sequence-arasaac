// Lògica de la configuració global
// Cap dependència d'Express — el consumeixen tant el registre com el panell d'admin

import type {
  AppConfig,
  RegistrationStatus,
} from "@sequence-arasaac/shared-types";
import { UserModel } from "../auth/model";
import {
  AppConfigModel,
  APP_CONFIG_KEY,
  DEFAULT_MAX_DAILY_SIGNUPS,
  DEFAULT_MAX_USERS,
  DEFAULT_REGISTRATION_OPEN,
} from "./model";
import { SignupCounterModel } from "./signupCounterModel";

// Camps que el panell d'administració pot modificar
export interface AppConfigUpdate {
  registrationOpen?: boolean;
  maxUsers?: number;
  maxDailySignups?: number;
}

// Dia en UTC en format `YYYY-MM-DD`. El tall és el mateix per a tothom i no
// depèn de la zona horària del servidor: qui llegeix l'estat rep també l'hora
// exacta del reinici (`resetsAt`) i el front la pinta en hora local.
const utcDayKey = (date: Date): string => date.toISOString().slice(0, 10);

// Mitjanit UTC següent: quan el comptador del dia torna a zero
const nextUtcMidnight = (date: Date): Date => {
  const next = new Date(date);
  next.setUTCHours(24, 0, 0, 0);
  return next;
};

// Llegeix la configuració, creant-la amb els valors per defecte si encara no existeix.
// upsert amb setOnInsert perquè dues peticions simultànies no creïn dos documents.
export const getAppConfig = async (): Promise<AppConfig> => {
  const config = await AppConfigModel.findOneAndUpdate(
    { key: APP_CONFIG_KEY },
    {
      $setOnInsert: {
        key: APP_CONFIG_KEY,
        registrationOpen: DEFAULT_REGISTRATION_OPEN,
        maxUsers: DEFAULT_MAX_USERS,
        maxDailySignups: DEFAULT_MAX_DAILY_SIGNUPS,
      },
    },
    { new: true, upsert: true }
  ).lean();

  return {
    registrationOpen: config.registrationOpen,
    maxUsers: config.maxUsers,
    // Les configuracions creades abans que existís el fre diari no el porten:
    // el valor per defecte s'aplica en llegir, sense migrar res
    maxDailySignups: config.maxDailySignups ?? DEFAULT_MAX_DAILY_SIGNUPS,
    updatedAt: config.updatedAt.toISOString(),
  };
};

// Actualitza només els camps rebuts — la resta es conserva
export const updateAppConfig = async (
  update: AppConfigUpdate
): Promise<AppConfig> => {
  // Garanteix que el document existeix abans d'actualitzar-lo
  await getAppConfig();

  const config = await AppConfigModel.findOneAndUpdate(
    { key: APP_CONFIG_KEY },
    { $set: update },
    { new: true }
  ).lean();

  // No hi pot arribar mai: getAppConfig acaba de garantir que existeix
  if (!config) {
    throw new Error("No s'ha pogut actualitzar la configuració global");
  }

  return {
    registrationOpen: config.registrationOpen,
    maxUsers: config.maxUsers,
    maxDailySignups: config.maxDailySignups ?? DEFAULT_MAX_DAILY_SIGNUPS,
    updatedAt: config.updatedAt.toISOString(),
  };
};

// Altes fetes avui. Un document que encara no existeix vol dir cap alta.
export const countSignupsToday = async (): Promise<number> => {
  const counter = await SignupCounterModel.findOne({
    day: utcDayKey(new Date()),
  })
    .select("count")
    .lean();

  return counter?.count ?? 0;
};

// Suma una alta al dia en curs. Es crida **després** de crear l'usuari: si la
// creació falla, el dia no es queda amb una plaça gastada per ningú.
// $inc amb upsert perquè dues altes simultànies no es trepitgin el comptador.
export const recordSignupToday = async (): Promise<void> => {
  await SignupCounterModel.updateOne(
    { day: utcDayKey(new Date()) },
    { $inc: { count: 1 } },
    { upsert: true }
  );
};

// El que se sap del registre sense tenir compte. No hi surt res que identifiqui
// ningú: recomptes i sostres, que és el que l'app vol poder ensenyar abans que
// algú ompli el formulari i descobreixi que avui ja no hi cap.
export const getRegistrationStatus = async (): Promise<RegistrationStatus> => {
  const now = new Date();

  // Independents entre elles: no hi ha cap motiu per encadenar-les
  const [config, totalUsers, signupsToday] = await Promise.all([
    getAppConfig(),
    // countDocuments i no estimatedDocumentCount, pel mateix motiu que al
    // signup: la xifra s'ensenya i ha de ser la de debò
    UserModel.countDocuments(),
    countSignupsToday(),
  ]);

  // Mai negatiu: si el sostre s'abaixa per sota del que ja hi ha, «queden -3»
  // no vol dir res per a qui ho llegeix
  const remainingUsers = Math.max(config.maxUsers - totalUsers, 0);
  const remainingToday = Math.max(config.maxDailySignups - signupsToday, 0);

  return {
    registrationOpen: config.registrationOpen,
    totalUsers,
    maxUsers: config.maxUsers,
    remainingUsers,
    maxDailySignups: config.maxDailySignups,
    signupsToday,
    remainingToday,
    resetsAt: nextUtcMidnight(now).toISOString(),
    canSignup: config.registrationOpen && remainingUsers > 0 && remainingToday > 0,
  };
};
