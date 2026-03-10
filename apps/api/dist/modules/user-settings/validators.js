"use strict";
// Esquemes Zod per validar els cossos de les peticions de user-settings
// Validació centralitzada — el controller no accedeix a req.body sense validar primer
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLangSchema = exports.updateSettingsSchema = void 0;
const zod_1 = require("zod");
const zodSchemas_1 = require("../../shared/zodSchemas");
// Schema per actualitzar DefaultSettings (tot l'objecte és obligatori)
exports.updateSettingsSchema = zodSchemas_1.defaultSettingsZodSchema;
// Schema per actualitzar langSettings
exports.updateLangSchema = zod_1.z.object({
    app: zod_1.z.enum(["ca", "en", "es"]),
    search: zod_1.z.string().min(1),
});
