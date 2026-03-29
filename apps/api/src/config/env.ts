// Validació de les variables d'entorn amb zod
// Si manquen variables obligatòries, el procés s'atura amb un missatge clar

import { config } from "dotenv";
import { z } from "zod";

config();

// Esquema de validació — tots els camps obligatoris per arrencar el servidor
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).default("3000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI és obligatòria"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET és obligatòria"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET és obligatòria"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME és obligatòria"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY és obligatòria"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET és obligatòria"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Error de configuració: variables d'entorn invàlides");
  console.error(parsed.error.format());
  process.exit(1);
}

// Exportació tipada de les variables d'entorn validades
export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
} as const;
