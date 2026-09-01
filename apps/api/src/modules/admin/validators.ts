// Esquemes Zod del mòdul d'administració

import { z } from "zod";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 25;
const MAX_EVENTS = 200;

// Query del llistat d'usuaris — els valors arriben com a string des de la URL
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

// Cos del PATCH d'usuari — només estat i quota.
// El rol no s'hi pot tocar a propòsit: promoure administradors des de l'API
// seria superfície d'atac per a un projecte amb un sol administrador.
export const updateUserSchema = z.object({
  status: z.enum(["pending", "active", "suspended"]).optional(),
  quotaOverride: z
    .object({
      documents: z.number().int().min(0).optional(),
      wordProfiles: z.number().int().min(0).optional(),
      storageBytes: z.number().int().min(0).optional(),
    })
    .optional(),
});

// Query dels esdeveniments de seguretat
export const listEventsQuerySchema = z.object({
  emailCanonical: z.string().trim().toLowerCase().optional(),
  ipHash: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_EVENTS).default(50),
});

// Query de l'esborrat en bloc d'errors del client.
// La data és obligatòria a propòsit: un DELETE sense filtre buidaria el registre
// sencer amb una URL que es pot escriure sense voler.
export const deleteClientErrorsQuerySchema = z.object({
  before: z.coerce.date(),
});

// Cos del PUT de configuració global
export const updateConfigSchema = z.object({
  registrationOpen: z.boolean().optional(),
  maxUsers: z.number().int().min(0).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type DeleteClientErrorsQuery = z.infer<
  typeof deleteClientErrorsQuerySchema
>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
