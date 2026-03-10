// Esquemes Zod per validar els cossos de les peticions de user-settings
// Validació centralitzada — el controller no accedeix a req.body sense validar primer

import { z } from "zod";
import { defaultSettingsZodSchema } from "../../shared/zodSchemas";

// Schema per actualitzar DefaultSettings (tot l'objecte és obligatori)
export const updateSettingsSchema = defaultSettingsZodSchema;

// Schema per actualitzar langSettings
export const updateLangSchema = z.object({
  app: z.enum(["ca", "en", "es"]),
  search: z.string().min(1),
});

// Tipus inferits — usats al controller i service
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateLangInput = z.infer<typeof updateLangSchema>;
