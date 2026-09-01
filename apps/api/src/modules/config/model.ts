// Model Mongoose de la configuració global de l'aplicació
//
// És una col·lecció d'un sol document. Viu a la base de dades i no a l'.env
// perquè el panell d'administració el pugui commutar amb un clic: si fos una
// variable d'entorn, tancar el registre voldria dir entrar a Render i esperar
// el reinici del servei, que és exactament el que no vols en una emergència.

import { Schema, model, Document } from "mongoose";

// Clau fixa del document únic — mai n'hi ha d'haver més d'un
export const APP_CONFIG_KEY = "global";

// Valors amb què es crea la configuració la primera vegada
export const DEFAULT_REGISTRATION_OPEN = true;
export const DEFAULT_MAX_USERS = 200;
// Altes que s'admeten cada dia. Va a part del sostre global: aquell diu quanta
// gent hi cap, aquest a quina velocitat pot entrar-hi. Amb 40 al dia, una
// campanya que es dispari es reparteix en dies i hi ha temps de veure-la venir.
export const DEFAULT_MAX_DAILY_SIGNUPS = 40;

export interface IAppConfig extends Document {
  key: string;
  registrationOpen: boolean;
  maxUsers: number;
  // Opcional a propòsit: les configuracions creades abans que existís el fre
  // diari no el porten, i el service hi posa el valor per defecte en llegir-les
  maxDailySignups?: number;
  updatedAt: Date;
}

const appConfigSchema = new Schema<IAppConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: APP_CONFIG_KEY,
    },
    registrationOpen: {
      type: Boolean,
      required: true,
      default: DEFAULT_REGISTRATION_OPEN,
    },
    // Sostre global d'usuaris: el fre que evita que una campanya inesperada
    // (o un atac) es converteixi en una factura de Cloudinary i Atlas
    maxUsers: {
      type: Number,
      required: true,
      default: DEFAULT_MAX_USERS,
      min: 0,
    },
    // Fre diari. No és `required`: les configuracions creades abans que
    // existís no el porten, i el service hi posa el valor per defecte en
    // llegir-les — el mateix criteri que amb qualsevol camp nou de dades velles.
    maxDailySignups: {
      type: Number,
      default: DEFAULT_MAX_DAILY_SIGNUPS,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const AppConfigModel = model<IAppConfig>("AppConfig", appConfigSchema);
