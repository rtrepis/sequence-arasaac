"use strict";
// Esquemes Zod per validar els cossos de les peticions de documents
// Validació centralitzada — el controller no accedeix a req.body sense validar primer
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentSchema = exports.createDocumentSchema = void 0;
const zod_1 = require("zod");
const zodSchemas_1 = require("../../shared/zodSchemas");
// --- Sub-schemas Zod per a PictSequence ---
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
    font: zodSchemas_1.fontZodSchema.optional(),
    numberFont: zodSchemas_1.fontZodSchema.optional(),
    fontSize: zod_1.z.number().optional(),
    fontFamily: zod_1.z.string().optional(),
    borderOut: zodSchemas_1.borderZodSchema.optional(),
    borderIn: zodSchemas_1.borderZodSchema.optional(),
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
// --- Esquemes principals per a crear i actualitzar documents ---
exports.createDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().max(200).optional(),
    content: zod_1.z.record(zod_1.z.string(), zod_1.z.array(pictSequenceZodSchema)),
    viewSettings: zod_1.z.record(zod_1.z.string(), sequenceViewSettingsZodSchema),
    activeSAAC: zod_1.z.number().int().min(0),
    order: zod_1.z.array(zod_1.z.number().int().min(0)).optional(),
    author: zod_1.z.string().max(200).optional(),
    defaultSettings: zodSchemas_1.defaultSettingsZodSchema.optional(),
});
// L'esquema d'actualització és idèntic al de creació — substitució completa del document
exports.updateDocumentSchema = exports.createDocumentSchema;
