// Registre d'esdeveniments de seguretat
//
// Traça mínima per detectar abús: qui s'ha registrat, des d'on (pseudonimitzat)
// i què ha fallat. No és un registre d'activitat de l'usuari — només hi entra el
// que serveix per decidir si cal suspendre un compte o tancar el registre.
//
// L'índex TTL és la peça important: MongoDB purga sol els documents caducats,
// de manera que mai s'acumula un històric d'orígens que no es vol tenir.

import { Schema, model, Document, Types } from "mongoose";

// Dies que es conserva cada esdeveniment. Trenta són prou per veure un patró
// d'abús i prou pocs per no convertir això en un arxiu permanent.
export const SECURITY_EVENT_TTL_DAYS = 30;

export type SecurityEventType =
  | "register"
  | "login_failed"
  | "account_locked"
  | "verify_sent"
  | "verify_completed"
  | "admin_action";

export interface ISecurityEvent extends Document {
  type: SecurityEventType;
  emailCanonical?: string;
  ipHash: string;
  // Detall lliure i curt (quina acció d'admin, quin motiu de rebuig)
  detail?: string;
  // Present només quan l'esdeveniment es refereix a un usuari existent
  userId?: Types.ObjectId;
  createdAt: Date;
}

const securityEventSchema = new Schema<ISecurityEvent>(
  {
    type: {
      type: String,
      enum: [
        "register",
        "login_failed",
        "account_locked",
        "verify_sent",
        "verify_completed",
        "admin_action",
      ],
      required: true,
      index: true,
    },
    emailCanonical: {
      type: String,
      required: false,
      index: true,
    },
    // Mai la IP en clar — vegeu shared/ipHash.ts
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    detail: {
      type: String,
      required: false,
      maxlength: 200,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    // L'índex TTL: MongoDB esborra el document sol en complir-se el termini.
    // Res de cron ni de tasques de manteniment.
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: SECURITY_EVENT_TTL_DAYS * 24 * 60 * 60,
    },
  },
  {
    // timestamps desactivat: createdAt es declara a mà per poder-hi posar el TTL
    versionKey: false,
  }
);

export const SecurityEventModel = model<ISecurityEvent>(
  "SecurityEvent",
  securityEventSchema
);
