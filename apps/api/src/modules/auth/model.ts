// Model Mongoose per a l'usuari
// Defineix l'esquema complet amb sub-schemas explícits per a cada sub-document

import { Schema, model, Document } from "mongoose";
import type {
  DefaultSettings,
  LangsApp,
} from "@sequence-arasaac/shared-types";

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

// --- Sub-schemas explícits (sense Schema.Types.Mixed) ---

// Sub-schema per a Font
const fontSchema = new Schema(
  {
    family: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

// Sub-schema per a Border
const borderSchema = new Schema(
  {
    color: { type: String, required: true },
    radius: { type: Number, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

// Sub-schema per a DefaultSettingsPictSequence
const pictSequenceSchema = new Schema(
  {
    numbered: { type: Boolean, required: true },
    textPosition: {
      type: String,
      enum: ["top", "bottom", "none"],
      required: true,
    },
    font: { type: fontSchema, required: true },
    numberFont: { type: fontSchema, required: true },
    borderOut: { type: borderSchema, required: true },
    borderIn: { type: borderSchema, required: true },
  },
  { _id: false }
);

// Sub-schema per a DefaultSettingsPictAra
const pictApiAraSchema = new Schema(
  {
    hair: {
      type: String,
      enum: ["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"],
      required: true,
    },
    skin: {
      type: String,
      enum: ["asian", "aztec", "black", "mulatto", "white"],
      required: true,
    },
    fitzgerald: { type: String, required: true },
    color: { type: Boolean, required: true },
  },
  { _id: false }
);

// Sub-schema per a DefaultSettings
const defaultSettingsSchema = new Schema(
  {
    pictSequence: { type: pictSequenceSchema, required: true },
    pictApiAra: { type: pictApiAraSchema, required: true },
  },
  { _id: false }
);

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
