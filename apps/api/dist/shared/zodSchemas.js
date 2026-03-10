"use strict";
// Esquemes Zod compartits entre mòduls
// Evita duplicació de sub-schemas comuns entre documents i user-settings
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSettingsZodSchema = exports.borderZodSchema = exports.fontZodSchema = void 0;
const zod_1 = require("zod");
// Schema Zod per a Font
exports.fontZodSchema = zod_1.z.object({
    family: zod_1.z.string(),
    color: zod_1.z.string(),
    size: zod_1.z.number(),
});
// Schema Zod per a Border
exports.borderZodSchema = zod_1.z.object({
    color: zod_1.z.string(),
    radius: zod_1.z.number(),
    size: zod_1.z.number(),
});
// Schema Zod per a DefaultSettings — compartit entre documents i user-settings
exports.defaultSettingsZodSchema = zod_1.z.object({
    pictSequence: zod_1.z.object({
        numbered: zod_1.z.boolean(),
        textPosition: zod_1.z.enum(["top", "bottom", "none"]),
        font: exports.fontZodSchema,
        numberFont: exports.fontZodSchema,
        borderOut: exports.borderZodSchema,
        borderIn: exports.borderZodSchema,
    }),
    pictApiAra: zod_1.z.object({
        hair: zod_1.z.string(),
        skin: zod_1.z.string(),
        fitzgerald: zod_1.z.string(),
        color: zod_1.z.boolean(),
    }),
});
