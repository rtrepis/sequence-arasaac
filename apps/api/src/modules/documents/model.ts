// Model Mongoose per a documents SAAC
// Emmagatzema DocumentSAAC amb les seqüències de pictogrames de l'usuari

import { Schema, model, Document, Types } from "mongoose";
import type {
  PictSequence,
  Sequence,
  SequenceViewSettings,
  SequenceAlignmentH,
  SequenceAlignmentV,
  SequenceAlignmentLegacy,
  FitzgeraldColorLegacy,
  DefaultSettings,
} from "@sequence-arasaac/shared-types";
import type { DocumentSAAC } from "@sequence-arasaac/shared-types";
import {
  fontSchema,
  borderSchema,
  defaultSettingsSchema,
} from "../../shared/mongooseSchemas";

// Imatge pujada a Cloudinary per aquest document.
// Els bytes es guarden en pujar-la perquè, en esborrar-la, es pugui restar
// exactament el que ocupava: sense això el comptador de consum només creixeria.
export interface DocumentAsset {
  publicId: string;
  bytes: number;
}

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
  assets: DocumentAsset[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Sub-schemas específics del document ---

// Sub-schema per a Word
const wordSchema = new Schema(
  {
    word: { type: String },
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
    // Mixed i no String: el client sempre hi ha escrit un color hexadecimal, però a la
    // base de dades hi pot haver l'objecte { value, color } d'abans. Amb String, llegir
    // un document antic petaria en hidratar-lo; la normalització es fa al serialitzar.
    fitzgerald: { type: Schema.Types.Mixed },
    color: { type: Boolean },
  },
  { _id: false }
);

// Sub-schema per a PictApiAra — url és la URL de Cloudinary (opcional, per a imatges personalitzades)
const pictApiAraDocSchema = new Schema(
  {
    searched: { type: wordSchema, required: true },
    selectedId: { type: Number, required: true },
    settings: { type: pictApiAraSettingsDocSchema, required: true },
    url: { type: String },
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

// Sub-schema per a SequenceViewSettings.
// Els dos camps d'alineació no són `required` i el camp antic `alignment` es manté
// declarat: un camp que l'esquema no declara no arriba a existir al document hidratat,
// i sense ell no hi hauria res a traduir en llegir un document desat abans de separar
// l'alineació en horitzontal i vertical.
const sequenceViewSettingsSchema = new Schema(
  {
    sizePict: { type: Number, required: true },
    pictSpaceBetween: { type: Number, required: true },
    alignmentH: { type: String, enum: ["left", "center", "right"] },
    alignmentV: { type: String, enum: ["top", "center", "bottom"] },
    // Llegat: només el llegeixen els documents antics. Res de nou l'escriu.
    alignment: { type: String, enum: ["left", "center", "right"] },
  },
  { _id: false }
);

// Sub-schema de les imatges pujades a Cloudinary
const documentAssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    bytes: { type: Number, required: true, min: 0 },
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
    // Els documents creats abans d'aquest camp no en tenen: el seu pes no es
    // pot conèixer retroactivament i compten com a zero fins que es tornin a desar
    assets: {
      type: [documentAssetSchema],
      required: true,
      default: () => [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DocumentModel = model<IDocument>("Document", documentSchema);

// --- Normalització de formats antics en llegir ---
//
// El client només entén el format actual. Traduir aquí, en un sol punt de sortida,
// estalvia que cada pantalla hagi de conèixer la història del model de dades.

// Valor d'alineació vertical per als documents anteriors a la separació H/V:
// abans només es podia alinear horitzontalment, i a dalt és el que es veia.
const LEGACY_ALIGNMENT_V: SequenceAlignmentV = "top";
const LEGACY_ALIGNMENT_H: SequenceAlignmentH = "left";

interface LegacyViewSettings extends Partial<SequenceViewSettings> {
  sizePict: number;
  pictSpaceBetween: number;
  alignment?: SequenceAlignmentLegacy;
}

const normalizeViewSettings = (
  viewSettings: Record<string, LegacyViewSettings>
): { [key: number]: SequenceViewSettings } => {
  const normalized: Record<string, SequenceViewSettings> = {};

  for (const [key, settings] of Object.entries(viewSettings)) {
    const { alignment, alignmentH, alignmentV, ...rest } = settings;
    normalized[key] = {
      ...rest,
      alignmentH: alignmentH ?? alignment ?? LEGACY_ALIGNMENT_H,
      alignmentV: alignmentV ?? LEGACY_ALIGNMENT_V,
    };
  }

  return normalized as { [key: number]: SequenceViewSettings };
};

// El fitzgerald d'un pictograma pot ser al document com l'objecte { value, color }
// d'abans; el client espera el color hexadecimal i prou.
const normalizeContent = (
  content: Record<string, PictSequence[]>
): { [key: number]: Sequence } => {
  for (const sequences of Object.values(content)) {
    for (const pict of sequences) {
      const fitzgerald = pict.img?.settings?.fitzgerald as
        | string
        | FitzgeraldColorLegacy
        | undefined;

      if (fitzgerald && typeof fitzgerald === "object") {
        pict.img.settings.fitzgerald = fitzgerald.color;
      }
    }
  }

  return content as { [key: number]: Sequence };
};

// Converteix un document Mongoose a DocumentSAAC per a la resposta JSON
// flattenMaps: true transforma les Maps de Mongoose a objectes plans
export const serializeDocument = (doc: IDocument): DocumentSAAC => {
  const obj = doc.toObject({ flattenMaps: true }) as Record<string, unknown>;
  return {
    id: String(obj._id),
    title: obj.title as string | undefined,
    content: normalizeContent(
      (obj.content ?? {}) as Record<string, PictSequence[]>
    ),
    viewSettings: normalizeViewSettings(
      (obj.viewSettings ?? {}) as Record<string, LegacyViewSettings>
    ),
    activeSAAC: obj.activeSAAC as number,
    order: obj.order as number[] | undefined,
    author: obj.author as string | undefined,
    defaultSettings: obj.defaultSettings as DefaultSettings | undefined,
  };
};
