"use strict";
// Esquemes Zod per validar els cossos de les peticions de documents
// Validació centralitzada — el controller no accedeix a req.body sense validar primer
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentSchema = exports.createDocumentSchema = void 0;
const zod_1 = require("zod");
// --- Sub-schemas Zod per a PictSequence ---
const fontZodSchema = zod_1.z.object({
    family: zod_1.z.string(),
    color: zod_1.z.string(),
    size: zod_1.z.number(),
});
const borderZodSchema = zod_1.z.object({
    color: zod_1.z.string(),
    radius: zod_1.z.number(),
    size: zod_1.z.number(),
});
const pictApiAraSettingsZodSchema = zod_1.z.object({
    hair: zod_1.z.string().optional(),
    skin: zod_1.z.string().optional(),
    fitzgerald: zod_1.z.string().optional(),
    color: zod_1.z.boolean().optional(),
});
const wordZodSchema = zod_1.z.object({
    word: zod_1.z.string(),
    bestIdPicts: zod_1.z.array(zod_1.z.number()),
    keyWords: zod_1.z.array(zod_1.z.string()).optional(),
});
const pictApiAraZodSchema = zod_1.z.object({
    searched: wordZodSchema,
    selectedId: zod_1.z.number(),
    settings: pictApiAraSettingsZodSchema,
});
const pictSequenceSettingsZodSchema = zod_1.z.object({
    numbered: zod_1.z.boolean().optional(),
    textPosition: zod_1.z.enum(["top", "bottom", "none"]).optional(),
    font: fontZodSchema.optional(),
    numberFont: fontZodSchema.optional(),
    fontSize: zod_1.z.number().optional(),
    fontFamily: zod_1.z.string().optional(),
    borderOut: borderZodSchema.optional(),
    borderIn: borderZodSchema.optional(),
});
const pictSequenceZodSchema = zod_1.z.object({
    indexSequence: zod_1.z.number(),
    img: pictApiAraZodSchema,
    text: zod_1.z.string().optional(),
    cross: zod_1.z.boolean(),
    settings: pictSequenceSettingsZodSchema,
});
// Sub-schema Zod per a SequenceViewSettings
const sequenceViewSettingsZodSchema = zod_1.z.object({
    sizePict: zod_1.z.number(),
    pictSpaceBetween: zod_1.z.number(),
    alignment: zod_1.z.enum(["left", "center", "right"]),
});
// Sub-schemas Zod per a DefaultSettings (per al camp opcional defaultSettings)
const fontDefaultZodSchema = zod_1.z.object({
    family: zod_1.z.string(),
    color: zod_1.z.string(),
    size: zod_1.z.number(),
});
const borderDefaultZodSchema = zod_1.z.object({
    color: zod_1.z.string(),
    radius: zod_1.z.number(),
    size: zod_1.z.number(),
});
const defaultSettingsZodSchema = zod_1.z.object({
    pictSequence: zod_1.z.object({
        numbered: zod_1.z.boolean(),
        textPosition: zod_1.z.enum(["top", "bottom", "none"]),
        font: fontDefaultZodSchema,
        numberFont: fontDefaultZodSchema,
        borderOut: borderDefaultZodSchema,
        borderIn: borderDefaultZodSchema,
    }),
    pictApiAra: zod_1.z.object({
        hair: zod_1.z.string(),
        skin: zod_1.z.string(),
        fitzgerald: zod_1.z.string(),
        color: zod_1.z.boolean(),
    }),
});
// --- Esquemes principals per a crear i actualitzar documents ---
exports.createDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().max(200).optional(),
    content: zod_1.z.record(zod_1.z.string(), zod_1.z.array(pictSequenceZodSchema)),
    viewSettings: zod_1.z.record(zod_1.z.string(), sequenceViewSettingsZodSchema),
    activeSAAC: zod_1.z.number().int().min(0),
    order: zod_1.z.array(zod_1.z.number().int().min(0)).optional(),
    author: zod_1.z.string().max(200).optional(),
    defaultSettings: defaultSettingsZodSchema.optional(),
});
// L'esquema d'actualització és idèntic al de creació — substitució completa del document
exports.updateDocumentSchema = exports.createDocumentSchema;
