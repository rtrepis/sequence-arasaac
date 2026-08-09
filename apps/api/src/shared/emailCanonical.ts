// Canonicalització d'adreces de correu
//
// Objectiu: que una mateixa bústia no pugui obrir diversos comptes.
// Gmail ignora els punts de la part local i tot el que va després d'un "+",
// de manera que "a.lg+u@gmail.com" i "alg@gmail.com" arriben al mateix lloc.
// Sense aquesta normalització, cada usuari té comptes gratuïts il·limitats.

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

  // Els alias amb "+" van al mateix compte: es descarten
  if (PLUS_ALIAS_DOMAINS.includes(domain)) {
    const plusIndex = localPart.indexOf("+");
    if (plusIndex !== -1) {
      localPart = localPart.slice(0, plusIndex);
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
