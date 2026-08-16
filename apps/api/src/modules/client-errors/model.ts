// Registre d'errors que han arribat a l'usuari
//
// Aquí només hi entra el que l'usuari ha vist: fallades que han sobreviscut als
// reintents i que li han sortit per pantalla. Els entrebancs transitoris (el servei
// engegant-se, una connexió que parpelleja) es resolen sols i no deixen rastre —
// registrar-los ompliria això de soroll i amagaria els problemes de veritat.
//
// Com el registre de seguretat, porta índex TTL: MongoDB purga sol i això no es
// converteix mai en un arxiu permanent d'activitat.

import { Schema, model, Document, Types } from "mongoose";

export const CLIENT_ERROR_TTL_DAYS = 30;

export interface IClientError extends Document {
  // Codi semàntic de la fallada: STORAGE_FULL, DOCUMENT_INVALID_FORMAT, HTTP_500…
  code: string;
  // On ha passat, en termes de producte: "settings-save", "document-save"…
  context: string;
  // Detall tècnic curt per orientar el diagnòstic
  detail?: string;
  userAgent?: string;
  userId?: Types.ObjectId;
  emailCanonical?: string;
  // Mai la IP en clar — vegeu shared/ipHash.ts
  ipHash: string;
  // Si ja s'ha avisat per correu d'aquest codi: evita repetir l'avís en ràfega
  alertSent: boolean;
  createdAt: Date;
}

const clientErrorSchema = new Schema<IClientError>(
  {
    code: { type: String, required: true, maxlength: 60, index: true },
    context: { type: String, required: true, maxlength: 60, index: true },
    detail: { type: String, required: false, maxlength: 300 },
    userAgent: { type: String, required: false, maxlength: 300 },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    emailCanonical: { type: String, required: false },
    ipHash: { type: String, required: true },
    alertSent: { type: Boolean, required: true, default: false },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: CLIENT_ERROR_TTL_DAYS * 24 * 60 * 60,
    },
  },
  {
    // timestamps desactivat: createdAt es declara a mà per poder-hi posar el TTL
    versionKey: false,
  }
);

export const ClientErrorModel = model<IClientError>(
  "ClientError",
  clientErrorSchema
);
