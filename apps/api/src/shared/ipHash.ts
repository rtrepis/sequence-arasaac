// Pseudonimització d'adreces IP
//
// La IP és dada personal. Per decidir si un registre és sospitós no cal saber-la:
// només cal poder respondre "quantes altes venen d'aquest mateix origen avui" i
// "aquest compte comparteix origen amb altres de suspesos". Un HMAC estable ho
// permet i deixa la base de dades sense cap IP llegible, ni tan sols per a qui
// hi tingui accés directe.
//
// L'HMAC (i no un hash pla) és necessari perquè l'espai d'adreces IPv4 és prou
// petit per fer-ne una taula sencera: sense clau secreta, un SHA-256 d'una IP
// es reverteix en minuts.

import { createHmac } from "crypto";
import { env } from "../config/env";

// Clau de treball per a desenvolupament, on IP_HASH_SECRET pot estar buida.
// A producció env.ts atura l'arrencada si falta, així que aquí no s'hi arriba mai.
const DEVELOPMENT_FALLBACK_SECRET = "dev-only-ip-hash-secret";

export const hashIp = (ip: string | undefined): string => {
  // Sense IP (peticions internes, tests) es retorna una marca explícita:
  // millor un valor reconeixible que una cadena buida que sembli un hash vàlid
  if (!ip) {
    return "unknown";
  }

  const secret = env.IP_HASH_SECRET || DEVELOPMENT_FALLBACK_SECRET;

  return createHmac("sha256", secret).update(ip).digest("hex");
};
