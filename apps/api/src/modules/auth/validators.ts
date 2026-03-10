// Esquemes Zod per validar els cossos de les peticions d'autenticació
// Validació centralitzada — el controller no accedeix a req.body sense validar primer

import { z } from "zod";

// Esquema de registre — email normalitzat a minúscules, contrasenya mínima 8 caràcters
export const registerSchema = z.object({
  email: z
    .string({ required_error: "El correu electrònic és obligatori" })
    .email("Format de correu electrònic invàlid")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string({ required_error: "La contrasenya és obligatòria" })
    .min(8, "La contrasenya ha de tenir mínim 8 caràcters")
    .max(128, "La contrasenya no pot superar els 128 caràcters"),
});

// Esquema de login — contrasenya sense validació de longitud mínima per no revelar regles
// Si l'usuari introdueix una contrasenya curta, ha de rebre "credencials incorrectes"
export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correu electrònic és obligatori" })
    .email("Format de correu electrònic invàlid")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string({ required_error: "La contrasenya és obligatòria" })
    .min(1, "La contrasenya és obligatòria"),
});

// Tipus inferits dels esquemes — usats al controller i service
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
