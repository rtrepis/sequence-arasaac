// Lògica de la configuració global
// Cap dependència d'Express — el consumeixen tant el registre com el panell d'admin

import type { AppConfig } from "@sequence-arasaac/shared-types";
import {
  AppConfigModel,
  APP_CONFIG_KEY,
  DEFAULT_MAX_USERS,
  DEFAULT_REGISTRATION_OPEN,
} from "./model";

// Camps que el panell d'administració pot modificar
export interface AppConfigUpdate {
  registrationOpen?: boolean;
  maxUsers?: number;
}

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
      },
    },
    { new: true, upsert: true }
  ).lean();

  return {
    registrationOpen: config.registrationOpen,
    maxUsers: config.maxUsers,
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
    updatedAt: config.updatedAt.toISOString(),
  };
};
