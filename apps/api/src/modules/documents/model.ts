// Model Mongoose per a documents SAAC
// Emmagatzema DocumentSAAC amb les seqüències de pictogrames de l'usuari

import { Schema, model, Document, Types } from "mongoose";
import type {
  PictSequence,
  Sequence,
  SequenceViewSettings,
  DefaultSettings,
} from "@sequence-arasaac/shared-types";
import type { DocumentSAAC } from "@sequence-arasaac/shared-types";
import {
  fontSchema,
  borderSchema,
  defaultSettingsSchema,
} from "../../shared/mongooseSchemas";

// Interfície TypeScript del document (estén Document de Mongoose)
export interface IDocument extends Document {
  userId: Types.ObjectId;
  title?: string;
  content: Map<string, PictSequence[]>;
  viewSettings: Map<string, SequenceViewSettings>;
  activeSAAC: number;
  order?: number[];
  author?: string;
  defaultSettings?: DefaultSettings;
  createdAt: Date;
  updatedAt: Date;
}

// --- Sub-schemas específics del document ---

// Sub-schema per a Word
const wordSchema = new Schema(
  {
    word: { type: String, required: true },
    bestIdPicts: [{ type: Number }],
    keyWords: [{ type: String }],
  },
  { _id: false }
);

// Sub-schema per a PictApiAraSettings (tots els camps opcionals)
const pictApiAraSettingsDocSchema = new Schema(
  {
    hair: {
      type: String,
      enum: ["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"],
    },
    skin: {
      type: String,
      enum: ["asian", "aztec", "black", "mulatto", "white"],
    },
    fitzgerald: {
      type: new Schema(
        { value: { type: String }, color: { type: String } },
        { _id: false }
      ),
    },
    color: { type: Boolean },
  },
  { _id: false }
);

// Sub-schema per a PictApiAra (sense camp url — es regenera al frontend)
const pictApiAraDocSchema = new Schema(
  {
    searched: { type: wordSchema, required: true },
    selectedId: { type: Number, required: true },
    settings: { type: pictApiAraSettingsDocSchema, required: true },
  },
  { _id: false }
);

// Sub-schema per a PictSequenceSettings (tots els camps opcionals)
const pictSequenceSettingsDocSchema = new Schema(
  {
    numbered: { type: Boolean },
    textPosition: { type: String, enum: ["top", "bottom", "none"] },
    font: { type: fontSchema },
    numberFont: { type: fontSchema },
    fontSize: { type: Number },
    fontFamily: { type: String },
    borderOut: { type: borderSchema },
    borderIn: { type: borderSchema },
  },
  { _id: false }
);

// Sub-schema per a PictSequence
const pictSequenceDocSchema = new Schema(
  {
    indexSequence: { type: Number, required: true },
    img: { type: pictApiAraDocSchema, required: true },
    text: { type: String },
    cross: { type: Boolean, required: true },
    settings: { type: pictSequenceSettingsDocSchema, required: true },
  },
  { _id: false }
);

// Sub-schema per a SequenceViewSettings
const sequenceViewSettingsSchema = new Schema(
  {
    sizePict: { type: Number, required: true },
    pictSpaceBetween: { type: Number, required: true },
    alignment: {
      type: String,
      enum: ["left", "center", "right"],
      required: true,
    },
  },
  { _id: false }
);

// --- Esquema principal del document ---

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String },
    // Map<string, PictSequence[]> — claus numèriques com a strings ("0", "1", ...)
    content: { type: Map, of: [pictSequenceDocSchema] },
    // Map<string, SequenceViewSettings>
    viewSettings: { type: Map, of: sequenceViewSettingsSchema },
    activeSAAC: { type: Number, required: true, default: 0 },
    order: [{ type: Number }],
    author: { type: String },
    defaultSettings: { type: defaultSettingsSchema },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DocumentModel = model<IDocument>("Document", documentSchema);

// Converteix un document Mongoose a DocumentSAAC per a la resposta JSON
// flattenMaps: true transforma les Maps de Mongoose a objectes plans
export const serializeDocument = (doc: IDocument): DocumentSAAC => {
  const obj = doc.toObject({ flattenMaps: true }) as Record<string, unknown>;
  return {
    id: String(obj._id),
    title: obj.title as string | undefined,
    content: (obj.content ?? {}) as { [key: number]: Sequence },
    viewSettings: (obj.viewSettings ?? {}) as {
      [key: number]: SequenceViewSettings;
    },
    activeSAAC: obj.activeSAAC as number,
    order: obj.order as number[] | undefined,
    author: obj.author as string | undefined,
    defaultSettings: obj.defaultSettings as DefaultSettings | undefined,
  };
};
