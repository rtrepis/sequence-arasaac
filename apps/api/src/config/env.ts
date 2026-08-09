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

  // --- Antifrau i correu ---
  // Opcionals a l'esquema perquè en desenvolupament es pugui arrencar sense elles
  // (el correu surt per consola i el hash d'IP usa una clau de treball).
  // A producció es comproven a sota i el procés s'atura si en falta cap.

  // Clau de l'HMAC amb què es pseudonimitzen les IP. Canviar-la invalida
  // totes les correlacions anteriors, que és precisament el que ha de passar.
  IP_HASH_SECRET: z.string().default(""),
  RESEND_API_KEY: z.string().default(""),
  // Remitent dels correus — ha de ser d'un domini verificat a Resend
  MAIL_FROM: z.string().default("SequenciAAC <onboarding@resend.dev>"),
  // Base pública del frontend, per construir l'enllaç de verificació
  APP_PUBLIC_URL: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Error de configuració: variables d'entorn invàlides");
  console.error(parsed.error.format());
  process.exit(1);
}

// Variables que només són obligatòries en producció.
// En desenvolupament tenen alternativa degradada; en producció, no tenir-les
// vol dir enviar correus a enlloc o pseudonimitzar IP amb una clau buida.
const PRODUCTION_REQUIRED = ["IP_HASH_SECRET", "RESEND_API_KEY"] as const;

if (parsed.data.NODE_ENV === "production") {
  const missing = PRODUCTION_REQUIRED.filter((key) => !parsed.data[key]);

  if (missing.length > 0) {
    console.error(
      `Error de configuració: a producció calen ${missing.join(", ")}`
    );
    process.exit(1);
  }
}

// Exportació tipada de les variables d'entorn validades
export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
} as const;
