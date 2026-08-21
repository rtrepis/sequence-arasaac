// Esquemes Zod per validar els cossos de les peticions d'autenticació
// Validació centralitzada — el controller no accedeix a req.body sense validar primer

import { z } from "zod";

// Idioma del correu de benvinguda: l'única informació d'idioma que arriba amb
// el signup, perquè encara no hi ha compte on llegir-la (a diferència de
// forgot-password i resend-verification, que la treuen de langSettings.app).
//
// z.string().optional() i no un enum: un valor que no sigui un dels cinc
// idiomes (o cap) no ha de tombar tot el signup per un detall cosmètic com és
// l'idioma del correu — el service ja hi aplica el mateix fallback a "ca" que
// s'usa a la resta de l'app.
const langsAppField = z.string().optional();

// Requisits de robustesa de la contrasenya que s'estableix a /set-password.
// Un símbol no és obligatori a propòsit: part de l'audiència d'AAC és gent gran
// o poc habituada a l'ordinador, i les tres regles de sota ja allunyen les
// contrasenyes trivials sense fer el formulari inabordable.
const PASSWORD_MIN_LENGTH = 10;
const passwordField = z
  .string({ required_error: "PASSWORD_REQUIRED" })
  .min(PASSWORD_MIN_LENGTH, "PASSWORD_TOO_SHORT")
  .max(128, "PASSWORD_TOO_LONG")
  .regex(/[a-z]/, "PASSWORD_MISSING_LOWERCASE")
  .regex(/[A-Z]/, "PASSWORD_MISSING_UPPERCASE")
  .regex(/[0-9]/, "PASSWORD_MISSING_NUMBER");

// Esquema del signup — sense contrasenya: es crea l'usuari i s'estableix
// la contrasenya després, a partir de l'enllaç del correu de benvinguda.
export const signupSchema = z
  .object({
    name: z
      .string({ required_error: "NAME_REQUIRED" })
      .trim()
      .min(1, "NAME_REQUIRED")
      .max(120, "NAME_TOO_LONG"),
    useCase: z.enum(["family", "teacher", "professional", "other"], {
      required_error: "USE_CASE_REQUIRED",
      invalid_type_error: "USE_CASE_REQUIRED",
    }),
    useCaseOther: z.string().trim().max(200).optional(),
    email: z
      .string({ required_error: "EMAIL_REQUIRED" })
      .email("EMAIL_INVALID_FORMAT")
      .transform((v) => v.toLowerCase().trim()),
    locale: langsAppField,
  })
  // useCaseOther només té sentit —i només s'hi guarda— quan useCase és "other"
  .transform((data) => ({
    ...data,
    useCaseOther: data.useCase === "other" ? data.useCaseOther : undefined,
  }));

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

// Esquema d'establiment de contrasenya — comú a la verificació inicial
// (type "verify" dins el token) i a la recuperació (type "reset")
export const setPasswordSchema = z
  .object({
    token: z.string({ required_error: "VERIFICATION_TOKEN_MISSING" }).min(1, "VERIFICATION_TOKEN_MISSING"),
    password: passwordField,
    passwordConfirmation: z.string({ required_error: "PASSWORD_REQUIRED" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "PASSWORD_MISMATCH",
    path: ["passwordConfirmation"],
  });

// Esquema de la recuperació de contrasenya — un sol camp, cap indici de si l'email existeix
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .email("EMAIL_INVALID_FORMAT")
    .transform((v) => v.toLowerCase().trim()),
});

// Esquema del reenviament del correu de verificació — ja no requereix sessió
export const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .email("EMAIL_INVALID_FORMAT")
    .transform((v) => v.toLowerCase().trim()),
});

// Tipus inferits dels esquemes — usats al controller i service
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
