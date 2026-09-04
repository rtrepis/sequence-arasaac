// Missatge amb què el panell fa arribar un enllaç d'accés.
//
// El botó «Envia» no envia res: obre un `mailto:` al client de correu de qui
// administra, i el missatge surt de la seva adreça. Un `mailto:` només porta
// text (RFC 6068), de manera que la plantilla amb marca dels correus del
// servidor (`apps/api/src/shared/emailLayout.ts`) aquí no hi té cabuda. El que
// sí que ha de dir és el mateix que diu aquella: a qui va, per què arriba i
// fins quan serveix l'enllaç. Qui el rep no ha demanat res i no espera cap
// correu d'una persona: un enllaç sol, sense nom ni context, s'assembla massa
// a una estafa —i el que hi ha darrere és establir la contrasenya d'un compte.
//
// **Aquest text és l'excepció a la regla que diu que el panell va en català.**
// La resta la llegeix qui administra; això ho llegeix l'usuari, que pot no
// entendre'l. Per això el resum d'usuari porta `lang`.

import type {
  AdminPasswordLink,
  AdminUserSummary,
  LangsApp,
} from "@sequence-arasaac/shared-types";

interface MailStrings {
  subjectVerify: string;
  subjectReset: string;
  greeting: (name?: string) => string;
  introVerify: string;
  introReset: string;
  expiry: (when: string) => string;
  // Només al de contrasenya nova: el de primer accés arriba a un compte que
  // qui el rep acaba de crear, i sap per què li escriuen. Un canvi de
  // contrasenya, en canvi, el pot haver engegat el panell sense que hagi
  // demanat res.
  ignoreReset: string;
}

// Etiqueta regional per a la data. La de l'usuari, no la de qui administra:
// l'hora surt escrita dins d'una frase del seu idioma.
const DATE_LOCALE: Record<LangsApp, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  it: "it-IT",
};

const MAIL_STRINGS: Record<LangsApp, MailStrings> = {
  ca: {
    subjectVerify: "Completa el registre a SequenciAAC",
    subjectReset: "Nova contrasenya de SequenciAAC",
    greeting: (name) => (name ? `Hola, ${name}!` : "Hola!"),
    introVerify:
      "T'envio a mà l'enllaç per activar el teu compte de SequenciAAC i triar la contrasenya:",
    introReset:
      "T'envio a mà l'enllaç per triar una contrasenya nova a SequenciAAC:",
    expiry: (when) =>
      `L'enllaç caduca el ${when}. Si ha caducat, respon aquest correu i te'n passo un altre.`,
    ignoreReset:
      "Si no has demanat cap canvi de contrasenya, ignora aquest missatge: la teva contrasenya actual continua funcionant.",
  },
  es: {
    subjectVerify: "Completa el registro en SequenciAAC",
    subjectReset: "Nueva contraseña de SequenciAAC",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    introVerify:
      "Te envío a mano el enlace para activar tu cuenta de SequenciAAC y elegir la contraseña:",
    introReset:
      "Te envío a mano el enlace para elegir una contraseña nueva en SequenciAAC:",
    expiry: (when) =>
      `El enlace caduca el ${when}. Si ha caducado, responde a este correo y te paso otro.`,
    ignoreReset:
      "Si no has pedido ningún cambio de contraseña, ignora este mensaje: tu contraseña actual sigue funcionando.",
  },
  en: {
    subjectVerify: "Finish setting up your SequenciAAC account",
    subjectReset: "New SequenciAAC password",
    greeting: (name) => (name ? `Hi, ${name}!` : "Hi!"),
    introVerify:
      "I'm sending you the link to activate your SequenciAAC account and choose your password:",
    introReset:
      "I'm sending you the link to choose a new SequenciAAC password:",
    expiry: (when) =>
      `The link expires on ${when}. If it has already expired, reply to this email and I'll send you another one.`,
    ignoreReset:
      "If you didn't ask for a password change, ignore this message: your current password still works.",
  },
  fr: {
    subjectVerify: "Terminez votre inscription à SequenciAAC",
    subjectReset: "Nouveau mot de passe SequenciAAC",
    greeting: (name) => (name ? `Bonjour, ${name} !` : "Bonjour !"),
    introVerify:
      "Je vous envoie le lien pour activer votre compte SequenciAAC et choisir votre mot de passe :",
    introReset:
      "Je vous envoie le lien pour choisir un nouveau mot de passe SequenciAAC :",
    expiry: (when) =>
      `Le lien expire le ${when}. S'il a déjà expiré, répondez à cet e-mail et je vous en envoie un autre.`,
    ignoreReset:
      "Si vous n'avez pas demandé de changement de mot de passe, ignorez ce message : votre mot de passe actuel continue de fonctionner.",
  },
  it: {
    subjectVerify: "Completa la registrazione a SequenciAAC",
    subjectReset: "Nuova password di SequenciAAC",
    greeting: (name) => (name ? `Ciao, ${name}!` : "Ciao!"),
    introVerify:
      "Ti mando a mano il link per attivare il tuo account SequenciAAC e scegliere la password:",
    introReset:
      "Ti mando a mano il link per scegliere una nuova password su SequenciAAC:",
    expiry: (when) =>
      `Il link scade il ${when}. Se è già scaduto, rispondi a questa email e te ne mando un altro.`,
    ignoreReset:
      "Se non hai richiesto nessun cambio di password, ignora questo messaggio: la tua password attuale continua a funzionare.",
  },
};

// Caducitat per al cos del missatge: dins d'una frase, el "05/09 18:30" de la
// taula es llegeix com un codi. Allà hi va sol, en una línia d'estat al costat
// de l'enllaç, i com més curt millor; aquí va enmig d'un text.
//
// Amb el fus horari escrit: l'hora surt en el del navegador de qui administra,
// que no té per què ser el de qui rep el missatge —del compte no en sabem el
// fus—, i sense dir-lo, un enllaç es pot donar per caducat quan encara serveix,
// o a l'inrevés.
const formatExpiry = (iso: string, lang: LangsApp): string =>
  new Date(iso).toLocaleString(DATE_LOCALE[lang], {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

// Construeix el `mailto:` amb què s'envia un enllaç d'accés, en l'idioma del
// compte de qui el rep.
export const buildPasswordLinkMailto = (
  user: AdminUserSummary,
  link: AdminPasswordLink,
): string => {
  const s = MAIL_STRINGS[user.lang] ?? MAIL_STRINGS.ca;
  const isVerify = link.type === "verify";

  const body = [
    s.greeting(user.name),
    "",
    isVerify ? s.introVerify : s.introReset,
    "",
    link.url,
    "",
    s.expiry(formatExpiry(link.expiresAt, user.lang)),
  ];

  if (!isVerify) {
    body.push(s.ignoreReset);
  }

  const subject = isVerify ? s.subjectVerify : s.subjectReset;

  return `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join("\n"))}`;
};
