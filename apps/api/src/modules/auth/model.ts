// Model Mongoose per a l'usuari
// Defineix l'esquema complet amb sub-schemas explícits per a cada sub-document

import { Schema, model, Document } from "mongoose";
import type {
  DefaultSettings,
  LangsApp,
} from "@sequence-arasaac/shared-types";
import { defaultSettingsSchema } from "../../shared/mongooseSchemas";

// Interfície TypeScript del document User (estén Document de Mongoose)
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  settings: DefaultSettings;
  langSettings: {
    app: LangsApp;
    search: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema per a langSettings
const langSettingsSchema = new Schema(
  {
    app: { type: String, enum: ["ca", "en", "es"], required: true },
    search: { type: String, required: true },
  },
  { _id: false }
);

// --- Valors per defecte per a nous usuaris ---
// Coherents amb els valors inicials de uiSlice al frontend

const DEFAULT_SETTINGS: DefaultSettings = {
  pictSequence: {
    numbered: false,
    textPosition: "bottom",
    font: {
      family: "Roboto",
      color: "#000000",
      size: 1.0,
    },
    numberFont: {
      family: "Roboto",
      color: "#000000",
      size: 1.0,
    },
    borderOut: {
      color: "#000000",
      radius: 4,
      size: 2,
    },
    borderIn: {
      color: "#000000",
      radius: 4,
      size: 0,
    },
  },
  pictApiAra: {
    hair: "brown",
    skin: "white",
    fitzgerald: "#FFCD94",
    color: true,
  },
} satisfies DefaultSettings;

// --- Esquema principal de l'usuari ---

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    settings: {
      type: defaultSettingsSchema,
      required: true,
      // Arrow function per evitar que Mongoose comparteixi la mateixa referència entre documents
      default: () => DEFAULT_SETTINGS,
    },
    langSettings: {
      type: langSettingsSchema,
      required: true,
      default: () => ({ app: "ca" as LangsApp, search: "ca" }),
    },
  },
  {
    timestamps: true, // afegeix createdAt i updatedAt automàticament
    versionKey: false, // elimina el camp __v dels documents
  }
);

export const UserModel = model<IUser>("User", userSchema);
