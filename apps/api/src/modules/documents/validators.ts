// Esquemes Zod per validar els cossos de les peticions de documents
// Validació centralitzada — el controller no accedeix a req.body sense validar primer

import { z } from "zod";
import {
  fontZodSchema,
  borderZodSchema,
  defaultSettingsZodSchema,
} from "../../shared/zodSchemas";
import { MAX_IMAGE_DATA_URL_LENGTH } from "../../shared/imageAssets";

// --- Sub-schemas Zod per a PictSequence ---

// skin i hair van amb els mateixos valors que l'esquema de Mongoose i no amb un
// string qualsevol: amb z.string() el rebuig arribava igualment, però com a error
// de validació de Mongoose (500) en comptes d'un 400 que diu què s'ha rebutjat.
// A més, així el tipus inferit serveix per derivar la miniatura sense conversions.
const pictApiAraSettingsZodSchema = z.object({
  hair: z
    .enum(["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"])
    .optional(),
  skin: z.enum(["asian", "aztec", "black", "mulatto", "white"]).optional(),
  // Color hexadecimal, no objecte: és el que el client escriu des de sempre
  fitzgerald: z.string().optional(),
  color: z.boolean().optional(),
});

const wordZodSchema = z.object({
  word: z.string(),
  bestIdPicts: z.array(z.number()),
  keyWords: z.array(z.string()).optional(),
});

const pictApiAraZodSchema = z.object({
  searched: wordZodSchema,
  selectedId: z.number(),
  settings: pictApiAraSettingsZodSchema,
  url: z.string().max(MAX_IMAGE_DATA_URL_LENGTH).optional(),
});

const pictSequenceSettingsZodSchema = z.object({
  numbered: z.boolean().optional(),
  textPosition: z.enum(["top", "bottom", "none"]).optional(),
  font: fontZodSchema.optional(),
  numberFont: fontZodSchema.optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  borderOut: borderZodSchema.optional(),
  borderIn: borderZodSchema.optional(),
});

const pictSequenceZodSchema = z.object({
  indexSequence: z.number(),
  img: pictApiAraZodSchema,
  text: z.string().optional(),
  cross: z.boolean(),
  settings: pictSequenceSettingsZodSchema,
});

// Sub-schema Zod per a SequenceViewSettings.
// L'alineació va passar de ser un sol camp a dos (horitzontal i vertical); l'entrada
// només accepta el format nou, que és l'únic que el client escriu. La lectura de
// documents antics es resol al model, no aquí.
const sequenceViewSettingsZodSchema = z.object({
  sizePict: z.number(),
  pictSpaceBetween: z.number(),
  alignmentH: z.enum(["left", "center", "right"]),
  alignmentV: z.enum(["top", "center", "bottom"]),
});

// Mides i espaiats de l'estil del document (esquema 2 del .saac). Opcional: els
// documents d'abans no en porten, i el client els obre amb l'estil per defecte
// de qui els obre. Vegeu docs/fonaments/sequencia-i-estil.md.
const sequenceStyleViewZodSchema = sequenceViewSettingsZodSchema.extend({
  sequenceSpaceBetween: z.number(),
});

// Disposició (direcció i format de pàgina). Reservada per a B26: avui el client
// no l'escriu, però l'esquema 2 ja l'admet perquè B26 no hagi d'obrir una v3.
const documentLayoutZodSchema = z.object({
  direction: z.enum(["row", "column"]).optional(),
  pageSize: z.enum(["A4", "A3", "FULLSCREEN"]).optional(),
  orientation: z.enum(["landscape", "portrait"]).optional(),
});

// --- Esquemes principals per a crear i actualitzar documents ---

export const createDocumentSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.record(z.string(), z.array(pictSequenceZodSchema)),
  viewSettings: z.record(z.string(), sequenceViewSettingsZodSchema),
  activeSAAC: z.number().int().min(0),
  order: z.array(z.number().int().min(0)).optional(),
  author: z.string().max(200).optional(),
  defaultSettings: defaultSettingsZodSchema.optional(),
  styleView: sequenceStyleViewZodSchema.optional(),
  layout: documentLayoutZodSchema.optional(),
});

// L'esquema d'actualització és idèntic al de creació — substitució completa del document
export const updateDocumentSchema = createDocumentSchema;

// Tipus inferits — usats al controller i service
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
