// Esquemes Zod per validar els cossos de les peticions de user-settings
import { z } from "zod";
import { defaultSettingsZodSchema } from "../../shared/zodSchemas";

export const updateUiSettingsSchema = z.object({
  lang: z.object({
    app: z.enum(["ca", "en", "es", "fr", "it"]),
    search: z.string().min(1),
  }),
  theme: z.enum(["light", "dark", "system"]),
  defaultSettings: defaultSettingsZodSchema,
});

export type UpdateUiSettingsInput = z.infer<typeof updateUiSettingsSchema>;
