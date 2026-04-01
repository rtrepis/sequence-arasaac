// Esquemes Zod per validar els cossos de les peticions d'autenticació
// Validació centralitzada — el controller no accedeix a req.body sense validar primer

import { z } from "zod";

// Esquema de registre — email normalitzat a minúscules, contrasenya mínima 8 caràcters
// Els missatges Zod usen codis d'error semàntics per facilitar la traducció al frontend
export const registerSchema = z.object({
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .email("EMAIL_INVALID_FORMAT")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string({ required_error: "PASSWORD_REQUIRED" })
    .min(8, "PASSWORD_TOO_SHORT")
    .max(128, "PASSWORD_TOO_LONG"),
});

// Esquema de login — contrasenya sense validació de longitud mínima per no revelar regles
// Si l'usuari introdueix una contrasenya curta, ha de rebre INVALID_CREDENTIALS
export const loginSchema = z.object({
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .email("EMAIL_INVALID_FORMAT")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string({ required_error: "PASSWORD_REQUIRED" })
    .min(1, "PASSWORD_REQUIRED"),
});

// Tipus inferits dels esquemes — usats al controller i service
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
