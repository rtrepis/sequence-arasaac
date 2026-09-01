// Comptador d'altes per dia
//
// Un document per dia, amb la data en UTC com a clau (`YYYY-MM-DD`). Podria
// semblar que n'hi hauria prou de comptar els usuaris creats des de mitjanit,
// però esborrar el compte (`deleteAccount`) esborra l'usuari **i** els seus
// esdeveniments de seguretat: qualsevol recompte derivat de la col·lecció
// d'usuaris es podria buidar donant-se de baixa, que és justament el que un
// fre diari ha d'impedir. El comptador, en canvi, només puja.
//
// Índex TTL de 60 dies: els dies vells no serveixen per a res i MongoDB els
// purga sol, com fa amb SecurityEvent.

import { Schema, model, Document } from "mongoose";

// Dies que es conserva el comptador d'un dia passat
const SIGNUP_COUNTER_TTL_DAYS = 60;

export interface ISignupCounter extends Document {
  day: string;
  count: number;
  createdAt: Date;
}

const signupCounterSchema = new Schema<ISignupCounter>(
  {
    // Dia en UTC, format `YYYY-MM-DD`
    day: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

signupCounterSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: SIGNUP_COUNTER_TTL_DAYS * 24 * 60 * 60 }
);

export const SignupCounterModel = model<ISignupCounter>(
  "SignupCounter",
  signupCounterSchema
);
