// Esquemes Zod per validar els cossos de les peticions de user-settings
import { z } from "zod";
import { defaultSettingsZodSchema } from "../../shared/zodSchemas";

const viewSettingsZodSchema = z.object({
  sizePict: z.number(),
  pictSpaceBetween: z.number(),
  sequenceSpaceBetween: z.number(),
  alignmentH: z.enum(["left", "center", "right"]),
  alignmentV: z.enum(["top", "center", "bottom"]),
  direction: z.enum(["row", "column"]),
  pageSize: z.enum(["A4", "A3", "FULLSCREEN"]),
  orientation: z.enum(["landscape", "portrait"]),
  author: z.string(),
});

export const updateUiSettingsSchema = z.object({
  lang: z.object({
    app: z.enum(["ca", "en", "es", "fr", "it"]),
    search: z.string().min(1),
  }),
  theme: z.enum(["light", "dark", "system"]),
  viewSettings: viewSettingsZodSchema.optional(),
  defaultSettings: defaultSettingsZodSchema,
});

export type UpdateUiSettingsInput = z.infer<typeof updateUiSettingsSchema>;
