// Model Mongoose per a l'usuari
// Defineix l'esquema complet amb sub-schemas explícits per a cada sub-document

import { Schema, model, Document } from "mongoose";
import type {
  DefaultSettings,
  LangsApp,
  ThemeMode,
  ViewSettings,
  WordProfile,
  UserTier,
  UserStatus,
  UserRole,
  UserUsage,
  QuotaLimits,
} from "@sequence-arasaac/shared-types";
import { defaultSettingsSchema, wordProfileSchema } from "../../shared/mongooseSchemas";

// Interfície TypeScript del document User (estén Document de Mongoose)
export interface IUser extends Document {
  email: string;
  emailCanonical: string;
  passwordHash: string;
  settings: DefaultSettings;
  langSettings: {
    app: LangsApp;
    search: string;
  };
  theme: ThemeMode;
  viewSettings?: ViewSettings;
  wordProfiles: WordProfile[];
  tier: UserTier;
  // --- Identitat i estat del compte ---
  emailVerified: boolean;
  status: UserStatus;
  role: UserRole;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  // --- Consum i límits ---
  usage: UserUsage;
  quotaOverride?: Partial<QuotaLimits>;
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema per a langSettings
const langSettingsSchema = new Schema(
  {
    app: { type: String, enum: ["ca", "en", "es", "fr", "it"], required: true },
    search: { type: String, required: true },
  },
  { _id: false }
);

// Sub-schema dels comptadors de consum — tots comencen a zero
const usageSchema = new Schema(
  {
    documentsCount: { type: Number, required: true, default: 0, min: 0 },
    wordProfilesCount: { type: Number, required: true, default: 0, min: 0 },
    storageBytes: { type: Number, required: true, default: 0, min: 0 },
    assetsCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

// Sub-schema d'excepcions de quota — tots els camps opcionals:
// només s'hi posa el límit que es vol sobreescriure respecte del tier
const quotaOverrideSchema = new Schema(
  {
    documents: { type: Number, min: 0 },
    wordProfiles: { type: Number, min: 0 },
    storageBytes: { type: Number, min: 0 },
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
    // Clau d'identitat real: sense alias de "+" ni punts als dominis que els ignoren.
    // L'email de sobre es conserva tal com el va escriure l'usuari per poder escriure-li.
    emailCanonical: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      required: true,
      default: "system",
    },
    viewSettings: {
      type: new Schema(
        {
          sizePict: { type: Number },
          pictSpaceBetween: { type: Number },
          sequenceSpaceBetween: { type: Number },
          alignmentH: { type: String, enum: ["left", "center", "right"] },
          alignmentV: { type: String, enum: ["top", "center", "bottom"] },
          direction: { type: String, enum: ["row", "column"] },
          pageSize: { type: String, enum: ["A4", "A3", "FULLSCREEN"] },
          orientation: { type: String, enum: ["landscape", "portrait"] },
          author: { type: String },
        },
        { _id: false }
      ),
      required: false,
    },
    wordProfiles: {
      type: [wordProfileSchema],
      required: true,
      default: () => [],
    },
    tier: {
      type: String,
      enum: ["free"],
      required: true,
      default: "free",
    },

    // --- Identitat i estat del compte ---

    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Un compte nou neix "pending": pot entrar i treballar, però no desar al núvol
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      required: true,
      default: "pending",
      index: true,
    },
    // Permís d'administració. El primer admin es posa a mà des d'Atlas:
    // no hi ha cap endpoint que promogui usuaris, seria superfície d'atac inútil
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    // S'incrementa per invalidar de cop tots els refresh tokens emesos a l'usuari
    tokenVersion: {
      type: Number,
      required: true,
      default: 0,
    },
    failedLoginAttempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lockUntil: {
      type: Date,
      required: false,
    },
    lastLoginAt: {
      type: Date,
      required: false,
    },

    // --- Consum i límits ---

    usage: {
      type: usageSchema,
      required: true,
      default: () => ({
        documentsCount: 0,
        wordProfilesCount: 0,
        storageBytes: 0,
        assetsCount: 0,
      }),
    },
    quotaOverride: {
      type: quotaOverrideSchema,
      required: false,
    },
  },
  {
    timestamps: true, // afegeix createdAt i updatedAt automàticament
    versionKey: false, // elimina el camp __v dels documents
  }
);

export const UserModel = model<IUser>("User", userSchema);
