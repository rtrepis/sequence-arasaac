// Registre i consulta d'esdeveniments de seguretat

import type { Types } from "mongoose";
import { SecurityEventModel } from "./model";
import type { SecurityEventType } from "./model";

// Dades amb què es registra un esdeveniment
export interface RecordEventInput {
  type: SecurityEventType;
  ipHash: string;
  emailCanonical?: string;
  detail?: string;
  userId?: Types.ObjectId | string;
}

// Deixa constància d'un esdeveniment.
// No llança mai: la traça és una eina de diagnòstic, i que falli d'escriure-la
// no ha de tombar un registre o un login que per l'usuari han anat bé.
export const recordSecurityEvent = async (
  input: RecordEventInput
): Promise<void> => {
  try {
    await SecurityEventModel.create(input);
  } catch (error) {
    console.error("No s'ha pogut registrar l'esdeveniment de seguretat:", error);
  }
};

// Compta esdeveniments d'un tipus des d'un mateix origen dins d'una finestra.
// Serveix per veure des del panell quantes altes venen d'una mateixa IP.
export const countRecentEvents = async (
  type: SecurityEventType,
  ipHash: string,
  windowMs: number
): Promise<number> => {
  const since = new Date(Date.now() - windowMs);
  return SecurityEventModel.countDocuments({
    type,
    ipHash,
    createdAt: { $gte: since },
  });
};

// Compta esdeveniments d'un tipus per a un usuari dins d'una finestra.
// S'usa per limitar el reenviament de correus de verificació sense afegir
// comptadors nous al document d'usuari: aquesta col·lecció ja caduca sola.
export const countRecentEventsForUser = async (
  type: SecurityEventType,
  userId: Types.ObjectId | string,
  windowMs: number
): Promise<number> => {
  const since = new Date(Date.now() - windowMs);
  return SecurityEventModel.countDocuments({
    type,
    userId,
    createdAt: { $gte: since },
  });
};
