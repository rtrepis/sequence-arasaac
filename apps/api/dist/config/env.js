"use strict";
// Validació de les variables d'entorn amb zod
// Si manquen variables obligatòries, el procés s'atura amb un missatge clar
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
// Esquema de validació — tots els camps obligatoris per arrencar el servidor
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: zod_1.z.string().regex(/^\d+$/).default("3000"),
    MONGODB_URI: zod_1.z.string().min(1, "MONGODB_URI és obligatòria"),
    JWT_SECRET: zod_1.z.string().min(1, "JWT_SECRET és obligatòria"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1, "JWT_REFRESH_SECRET és obligatòria"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:5173"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Error de configuració: variables d'entorn invàlides");
    console.error(parsed.error.format());
    process.exit(1);
}
// Exportació tipada de les variables d'entorn validades
exports.env = {
    ...parsed.data,
    PORT: parseInt(parsed.data.PORT, 10),
};
