// Esquemes Zod per validar els cossos de les peticions de documents
// Validació centralitzada — el controller no accedeix a req.body sense validar primer

import { z } from "zod";
import {
  fontZodSchema,
  borderZodSchema,
  defaultSettingsZodSchema,
} from "../../shared/zodSchemas";

// --- Sub-schemas Zod per a PictSequence ---

const fitzgeraldColorZodSchema = z.object({
  value: z.string(),
  color: z.string(),
});

const pictApiAraSettingsZodSchema = z.object({
  hair: z.string().optional(),
  skin: z.string().optional(),
  fitzgerald: fitzgeraldColorZodSchema.optional(),
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

// Sub-schema Zod per a SequenceViewSettings
const sequenceViewSettingsZodSchema = z.object({
  sizePict: z.number(),
  pictSpaceBetween: z.number(),
  alignment: z.enum(["left", "center", "right"]),
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
});

// L'esquema d'actualització és idèntic al de creació — substitució completa del document
export const updateDocumentSchema = createDocumentSchema;

// Tipus inferits — usats al controller i service
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
