// Esquemes Zod compartits entre mòduls
// Evita duplicació de sub-schemas comuns entre documents i user-settings

import { z } from "zod";

// Schema Zod per a Font
export const fontZodSchema = z.object({
  family: z.string(),
  color: z.string(),
  size: z.number(),
});

// Schema Zod per a Border
export const borderZodSchema = z.object({
  color: z.string(),
  radius: z.number(),
  size: z.number(),
});

// Schema Zod per a DefaultSettings — compartit entre documents i user-settings
export const defaultSettingsZodSchema = z.object({
  pictSequence: z.object({
    numbered: z.boolean(),
    textPosition: z.enum(["top", "bottom", "none"]),
    font: fontZodSchema,
    numberFont: fontZodSchema,
    borderOut: borderZodSchema,
    borderIn: borderZodSchema,
  }),
  pictApiAra: z.object({
    hair: z.string(),
    skin: z.string(),
    fitzgerald: z.string(),
    color: z.boolean(),
  }),
});
