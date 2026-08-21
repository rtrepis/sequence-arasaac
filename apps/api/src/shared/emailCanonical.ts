// Canonicalització d'adreces de correu
//
// Objectiu: que una mateixa bústia no pugui obrir diversos comptes.
// Gmail ignora els punts de la part local i tot el que va després d'un "+",
// de manera que "a.lg+u@gmail.com" i "alg@gmail.com" arriben al mateix lloc.
// Sense aquesta normalització, cada usuari té comptes gratuïts il·limitats.
//
// Excepció: les bústies llistades a PLUS_ALIAS_EXEMPT_EMAILS conserven
// l'alias "+" com a part de la identitat, així que "algu+ca@gmail.com" i
// "algu+es@gmail.com" hi són dos comptes diferents. És només per a proves
// internes (verificar cada idioma amb un compte real) — els punts es
// continuen ignorant igual, i qualsevol altra bústia es comporta com sempre.

import { env } from "../config/env";

// Dominis que ignoren els punts i admeten sub-adreces amb "+"
const DOT_INSENSITIVE_DOMAINS = ["gmail.com", "googlemail.com"];

// Dominis que són àlies d'un altre: la mateixa bústia amb dos noms.
// googlemail.com és el nom històric de gmail.com i els correus hi arriben igual,
// de manera que sense aquesta equivalència quedaria una porta oberta evident.
const DOMAIN_ALIASES: Record<string, string> = {
  "googlemail.com": "gmail.com",
};

// Dominis que admeten sub-adreces amb "+" però sí que distingeixen els punts
const PLUS_ALIAS_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "fastmail.com",
  "protonmail.com",
  "proton.me",
];

// Bústia base (part local sense alias "+", amb els punts ja tractats com
// correspongui al domini) exempta del descart de l'alias "+".
// Normalitzada amb la mateixa lògica que toCanonicalEmail perquè
// "Algu@Gmail.com" a la variable d'entorn i "algu" hi coincideixin.
const toExemptBase = (rawEntry: string): string => {
  const trimmed = rawEntry.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0) {
    return trimmed;
  }
  const local = trimmed.slice(0, atIndex);
  const rawDomain = trimmed.slice(atIndex + 1);
  const domain = DOMAIN_ALIASES[rawDomain] ?? rawDomain;
  const dotStripped = DOT_INSENSITIVE_DOMAINS.includes(domain)
    ? local.replace(/\./g, "")
    : local;
  return `${dotStripped}@${domain}`;
};

const PLUS_ALIAS_EXEMPT_BASES = env.PLUS_ALIAS_EXEMPT_EMAILS.split(",")
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0)
  .map(toExemptBase);

// Retorna la forma canònica d'un email: la clau d'identitat real de l'usuari.
// L'email original s'ha de conservar igualment — és el que es fa servir per escriure-li.
export const toCanonicalEmail = (email: string): string => {
  const normalized = email.trim().toLowerCase();

  const atIndex = normalized.lastIndexOf("@");
  // Sense "@" no hi ha res a canonicalitzar; la validació Zod ja ho hauria aturat abans
  if (atIndex <= 0) {
    return normalized;
  }

  let localPart = normalized.slice(0, atIndex);
  const rawDomain = normalized.slice(atIndex + 1);
  const domain = DOMAIN_ALIASES[rawDomain] ?? rawDomain;

  // Els alias amb "+" van al mateix compte: es descarten — tret que la
  // bústia base estigui exempta (proves internes, vegeu PLUS_ALIAS_EXEMPT_EMAILS)
  if (PLUS_ALIAS_DOMAINS.includes(domain)) {
    const plusIndex = localPart.indexOf("+");
    if (plusIndex !== -1) {
      const base = localPart.slice(0, plusIndex);
      const isExempt = PLUS_ALIAS_EXEMPT_BASES.includes(
        toExemptBase(`${base}@${domain}`)
      );
      if (!isExempt) {
        localPart = base;
      }
    }
  }

  // Els punts només s'eliminen on el proveïdor els ignora.
  // A un domini corporatiu, "joan.puig@" i "joanpuig@" poden ser dues persones diferents.
  if (DOT_INSENSITIVE_DOMAINS.includes(domain)) {
    localPart = localPart.replace(/\./g, "");
  }

  // Un alias que buida del tot la part local ("+algu@gmail.com") no és canonicalitzable:
  // val més conservar l'original que generar una clau buida que col·lisionaria amb tothom
  if (localPart.length === 0) {
    return normalized;
  }

  return `${localPart}@${domain}`;
};
