// Enviament de correu transaccional
//
// Embolcall prim sobre Resend: és l'únic fitxer del projecte que sap quin
// proveïdor de correu es fa servir. Canviar-lo no ha de tocar res més.
//
// Cap funció d'aquest mòdul llança mai. El correu és un canal que falla sol
// (quota diària esgotada, incidència del proveïdor, domini no verificat) i cap
// d'aquestes coses pot impedir que un usuari es doni d'alta. Qui crida aquestes
// funcions rep un boolean i decideix què n'explica a l'usuari.

import { Resend } from "resend";
import { env } from "../config/env";
import type { LangsApp } from "@sequence-arasaac/shared-types";
import { DEFAULT_LANGS_APP } from "./langsApp";

// Client mandrós: només es construeix si hi ha clau, perquè en desenvolupament
// el mòdul es pugui importar sense credencials
let resendClient: Resend | null = null;

const getClient = (): Resend | null => {
  if (!env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
};

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Resultat d'un enviament. El motiu només s'omple quan falla i és el que diu
// el proveïdor, retallat: qui truca no el pot interpretar, però l'ha de poder
// deixar al registre d'errors. Fins ara la fallada només anava a la consola
// del servidor, que és el lloc on ningú mira fins que algú es queixa.
export interface MailResult {
  sent: boolean;
  reason?: string;
}

// Llargada del motiu: la mateixa que admet el `detail` del registre d'errors
const MAX_REASON_LENGTH = 300;

const toReason = (error: unknown): string => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);

  return message.slice(0, MAX_REASON_LENGTH);
};

// Envia un correu. Diu si s'ha pogut lliurar al proveïdor i, si no, per què.
const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<MailResult> => {
  const client = getClient();

  // Sense credencials (desenvolupament) el correu surt per consola.
  // Permet provar el flux sencer sense gastar la quota diària de Resend.
  if (!client) {
    console.log("\n--- Correu no enviat (sense RESEND_API_KEY) ---");
    console.log(`Per a:   ${to}`);
    console.log(`Assumpte: ${subject}`);
    console.log(text);
    console.log("--- fi del correu ---\n");
    return { sent: true };
  }

  try {
    const { error } = await client.emails.send({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Resend ha rebutjat el correu:", error);
      return { sent: false, reason: toReason(error) };
    }

    return { sent: true };
  } catch (error) {
    console.error("Error en enviar el correu:", error);
    return { sent: false, reason: toReason(error) };
  }
};

interface ClientErrorAlert {
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  emailCanonical?: string;
}

// Avís intern quan un usuari topa amb un error que no s'ha resolt sol.
// Va en català i sense format: el llegeix una sola persona i el que importa és
// que el codi i el context es vegin de seguida a la safata d'entrada.
export const sendClientErrorAlert = async (
  to: string,
  { code, context, detail, userAgent, emailCanonical }: ClientErrorAlert
): Promise<MailResult> => {
  const subject = `[SequenciAAC] Error a ${context}: ${code}`;

  const lines = [
    `Codi:     ${code}`,
    `On:       ${context}`,
    `Quan:     ${new Date().toISOString()}`,
    `Usuari:   ${emailCanonical ?? "(sense sessió)"}`,
    `Detall:   ${detail ?? "(cap)"}`,
    `Navegador: ${userAgent ?? "(desconegut)"}`,
    "",
    "Els errors passatgers (servei engegant-se, connexió intermitent) no arriben",
    "aquí: només els que l'usuari ha acabat veient per pantalla.",
    "No en rebràs cap altre d'aquest mateix codi durant una hora.",
  ];

  const text = lines.join("\n");
  const html = `<pre style="font-family: monospace; font-size: 14px;">${lines
    .join("\n")
    .replace(/</g, "&lt;")}</pre>`;

  return sendEmail({ to, subject, html, text });
};

// Botó reutilitzat als dos correus que porten a /set-password
const actionButton = (url: string, label: string): string => `
  <p>
    <a href="${url}"
       style="display: inline-block; padding: 12px 20px; background: #8ac34a;
              color: #1E2A12; text-decoration: none; border-radius: 6px; font-weight: bold;">
      ${label}
    </a>
  </p>
`;

interface VerificationStrings {
  subject: string;
  greeting: (name?: string) => string;
  body1: string;
  body2: string;
  buttonLabel: string;
  expiry: string;
  ignore: string;
}

interface AccountExistsStrings {
  subject: string;
  greeting: (name?: string) => string;
  body1: string;
  body2: string;
  body3: string;
  buttonLabel: string;
  expiry: string;
}

interface PasswordResetStrings {
  subject: string;
  greeting: string;
  body1: string;
  body2: string;
  buttonLabel: string;
  expiry: string;
  ignore: string;
}

// Un joc de textos complet per idioma. Cap altra part del fitxer coneix cap
// literal traduïble: tot passa per aquí.
const VERIFICATION_STRINGS: Record<LangsApp, VerificationStrings> = {
  ca: {
    subject: "Benvingut/da a SequenciAAC — confirma el teu compte",
    greeting: (name) => (name ? `Hola, ${name}!` : "Hola!"),
    body1: "Gràcies per crear un compte a SequenciAAC.",
    body2: "Per acabar-lo de configurar i triar la teva contrasenya, confirma aquesta adreça:",
    buttonLabel: "Confirma i tria la contrasenya",
    expiry: "L'enllaç caduca d'aquí a 24 hores.",
    ignore: "Si no has estat tu qui ha creat el compte, pots ignorar aquest missatge.",
  },
  es: {
    subject: "Bienvenido/a a SequenciAAC — confirma tu cuenta",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    body1: "Gracias por crear una cuenta en SequenciAAC.",
    body2: "Para acabar de configurarla y elegir tu contraseña, confirma esta dirección:",
    buttonLabel: "Confirma y elige la contraseña",
    expiry: "El enlace caduca dentro de 24 horas.",
    ignore: "Si no has sido tú quien ha creado la cuenta, puedes ignorar este mensaje.",
  },
  en: {
    subject: "Welcome to SequenciAAC — confirm your account",
    greeting: (name) => (name ? `Hi, ${name}!` : "Hi!"),
    body1: "Thanks for creating an account on SequenciAAC.",
    body2: "To finish setting it up and choose your password, confirm this address:",
    buttonLabel: "Confirm and choose password",
    expiry: "The link expires in 24 hours.",
    ignore: "If you didn't create this account, you can ignore this message.",
  },
  fr: {
    subject: "Bienvenue sur SequenciAAC — confirmez votre compte",
    greeting: (name) => (name ? `Bonjour, ${name} !` : "Bonjour !"),
    body1: "Merci d'avoir créé un compte sur SequenciAAC.",
    body2: "Pour terminer sa configuration et choisir votre mot de passe, confirmez cette adresse :",
    buttonLabel: "Confirmer et choisir le mot de passe",
    expiry: "Le lien expire dans 24 heures.",
    ignore: "Si vous n'êtes pas à l'origine de la création de ce compte, vous pouvez ignorer ce message.",
  },
  it: {
    subject: "Benvenuto/a su SequenciAAC — conferma il tuo account",
    greeting: (name) => (name ? `Ciao, ${name}!` : "Ciao!"),
    body1: "Grazie per aver creato un account su SequenciAAC.",
    body2: "Per completare la configurazione e scegliere la password, conferma questo indirizzo:",
    buttonLabel: "Conferma e scegli la password",
    expiry: "Il link scade tra 24 ore.",
    ignore: "Se non sei stato tu a creare l'account, puoi ignorare questo messaggio.",
  },
};

const ACCOUNT_EXISTS_STRINGS: Record<LangsApp, AccountExistsStrings> = {
  ca: {
    subject: "Algú ha intentat crear un compte amb aquest correu — SequenciAAC",
    greeting: (name) => (name ? `Hola, ${name}!` : "Hola!"),
    body1: "Algú ha intentat crear un compte a SequenciAAC amb aquesta adreça, però ja en tens un.",
    body2: "Si no has estat tu, pots ignorar aquest missatge: no s'ha canviat res del teu compte.",
    body3: "Si has estat tu i no recordes la contrasenya, pots triar-ne una de nova aquí:",
    buttonLabel: "Tria una contrasenya nova",
    expiry: "L'enllaç caduca d'aquí a 1 hora.",
  },
  es: {
    subject: "Alguien ha intentado crear una cuenta con este correo — SequenciAAC",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    body1: "Alguien ha intentado crear una cuenta en SequenciAAC con esta dirección, pero ya tienes una.",
    body2: "Si no has sido tú, puedes ignorar este mensaje: no se ha cambiado nada en tu cuenta.",
    body3: "Si has sido tú y no recuerdas la contraseña, puedes elegir una nueva aquí:",
    buttonLabel: "Elige una contraseña nueva",
    expiry: "El enlace caduca dentro de 1 hora.",
  },
  en: {
    subject: "Someone tried to create an account with this email — SequenciAAC",
    greeting: (name) => (name ? `Hi, ${name}!` : "Hi!"),
    body1: "Someone tried to create an account on SequenciAAC with this address, but you already have one.",
    body2: "If it wasn't you, you can ignore this message: nothing has changed on your account.",
    body3: "If it was you and you don't remember the password, you can choose a new one here:",
    buttonLabel: "Choose a new password",
    expiry: "The link expires in 1 hour.",
  },
  fr: {
    subject: "Quelqu'un a essayé de créer un compte avec cet e-mail — SequenciAAC",
    greeting: (name) => (name ? `Bonjour, ${name} !` : "Bonjour !"),
    body1: "Quelqu'un a essayé de créer un compte sur SequenciAAC avec cette adresse, mais vous en avez déjà un.",
    body2: "Si ce n'était pas vous, vous pouvez ignorer ce message : rien n'a changé sur votre compte.",
    body3: "Si c'était vous et que vous ne vous souvenez plus du mot de passe, vous pouvez en choisir un nouveau ici :",
    buttonLabel: "Choisir un nouveau mot de passe",
    expiry: "Le lien expire dans 1 heure.",
  },
  it: {
    subject: "Qualcuno ha provato a creare un account con questa email — SequenciAAC",
    greeting: (name) => (name ? `Ciao, ${name}!` : "Ciao!"),
    body1: "Qualcuno ha provato a creare un account su SequenciAAC con questo indirizzo, ma ne hai già uno.",
    body2: "Se non sei stato tu, puoi ignorare questo messaggio: non è cambiato nulla nel tuo account.",
    body3: "Se sei stato tu e non ricordi la password, puoi sceglierne una nuova qui:",
    buttonLabel: "Scegli una nuova password",
    expiry: "Il link scade tra 1 ora.",
  },
};

const PASSWORD_RESET_STRINGS: Record<LangsApp, PasswordResetStrings> = {
  ca: {
    subject: "Recupera la teva contrasenya — SequenciAAC",
    greeting: "Hola!",
    body1: "Hem rebut una petició per canviar la contrasenya del teu compte a SequenciAAC.",
    body2: "Per triar-ne una de nova, obre aquest enllaç:",
    buttonLabel: "Tria una contrasenya nova",
    expiry: "L'enllaç caduca d'aquí a 1 hora.",
    ignore: "Si no has estat tu qui ho ha demanat, pots ignorar aquest missatge: la teva contrasenya actual continua funcionant.",
  },
  es: {
    subject: "Recupera tu contraseña — SequenciAAC",
    greeting: "¡Hola!",
    body1: "Hemos recibido una petición para cambiar la contraseña de tu cuenta en SequenciAAC.",
    body2: "Para elegir una nueva, abre este enlace:",
    buttonLabel: "Elige una contraseña nueva",
    expiry: "El enlace caduca dentro de 1 hora.",
    ignore: "Si no has sido tú quien lo ha pedido, puedes ignorar este mensaje: tu contraseña actual sigue funcionando.",
  },
  en: {
    subject: "Reset your password — SequenciAAC",
    greeting: "Hi!",
    body1: "We received a request to change the password for your SequenciAAC account.",
    body2: "To choose a new one, open this link:",
    buttonLabel: "Choose a new password",
    expiry: "The link expires in 1 hour.",
    ignore: "If you didn't request this, you can ignore this message: your current password still works.",
  },
  fr: {
    subject: "Récupérez votre mot de passe — SequenciAAC",
    greeting: "Bonjour !",
    body1: "Nous avons reçu une demande de changement du mot de passe de votre compte SequenciAAC.",
    body2: "Pour en choisir un nouveau, ouvrez ce lien :",
    buttonLabel: "Choisir un nouveau mot de passe",
    expiry: "Le lien expire dans 1 heure.",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message : votre mot de passe actuel continue de fonctionner.",
  },
  it: {
    subject: "Recupera la tua password — SequenciAAC",
    greeting: "Ciao!",
    body1: "Abbiamo ricevuto una richiesta di cambio password per il tuo account SequenciAAC.",
    body2: "Per sceglierne una nuova, apri questo link:",
    buttonLabel: "Scegli una nuova password",
    expiry: "Il link scade tra 1 ora.",
    ignore: "Se non sei stato tu a richiederlo, puoi ignorare questo messaggio: la tua password attuale continua a funzionare.",
  },
};

// Cos del correu de benvinguda + verificació. Text pla i HTML mínim a propòsit:
// arriba millor a la safata d'entrada i es llegeix igual en qualsevol client.
//
// Dues parts diferenciades: una de benvinguda (el compte ja existeix, encara no
// es pot fer servir) i una d'acció (el botó porta a triar la contrasenya). Sense
// contrasenya no hi ha compte operatiu, així que aquest enllaç no és opcional.
export const sendVerificationEmail = async (
  to: string,
  name: string | undefined,
  verificationUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> => {
  const s = VERIFICATION_STRINGS[locale] ?? VERIFICATION_STRINGS[DEFAULT_LANGS_APP];
  const greeting = s.greeting(name);

  const text = [
    greeting,
    "",
    s.body1,
    "",
    s.body2,
    verificationUrl,
    "",
    s.expiry,
    s.ignore,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5; color: #1E2A12;">
      <p>${greeting}</p>
      <p>${s.body1}</p>
      <p>${s.body2}</p>
      ${actionButton(verificationUrl, s.buttonLabel)}
      <p style="font-size: 14px; color: #555;">
        ${s.expiry}<br />
        ${s.ignore}
      </p>
    </div>
  `;

  return sendEmail({ to, subject: s.subject, html, text });
};

// Cos de l'avís quan algú intenta un signup amb un correu que ja té compte.
// No diu "aquest correu ja existeix" enlloc de l'aplicació —això revelaria
// comptes a qui prova adreces a l'atzar—; l'avís només arriba a la bústia
// real, que és qui de debò necessita saber-ho. Cobreix els dos casos possibles
// sense distingir-los: no ha estat l'usuari (ignora-ho) o sí (aquí tens l'enllaç).
export const sendAccountExistsEmail = async (
  to: string,
  name: string | undefined,
  resetUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> => {
  const s = ACCOUNT_EXISTS_STRINGS[locale] ?? ACCOUNT_EXISTS_STRINGS[DEFAULT_LANGS_APP];
  const greeting = s.greeting(name);

  const text = [
    greeting,
    "",
    s.body1,
    "",
    s.body2,
    "",
    s.body3,
    resetUrl,
    "",
    s.expiry,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5; color: #1E2A12;">
      <p>${greeting}</p>
      <p>${s.body1}</p>
      <p>${s.body2}</p>
      <p>${s.body3}</p>
      ${actionButton(resetUrl, s.buttonLabel)}
      <p style="font-size: 14px; color: #555;">
        ${s.expiry}
      </p>
    </div>
  `;

  return sendEmail({ to, subject: s.subject, html, text });
};

// Cos del correu de recuperació de contrasenya. Mateix estil que el de
// verificació però sense to de benvinguda: aquí ja hi ha un compte fet servir.
export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> => {
  const s = PASSWORD_RESET_STRINGS[locale] ?? PASSWORD_RESET_STRINGS[DEFAULT_LANGS_APP];

  const text = [
    s.greeting,
    "",
    s.body1,
    s.body2,
    resetUrl,
    "",
    s.expiry,
    s.ignore,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5; color: #1E2A12;">
      <p>${s.greeting}</p>
      <p>${s.body1}</p>
      <p>${s.body2}</p>
      ${actionButton(resetUrl, s.buttonLabel)}
      <p style="font-size: 14px; color: #555;">
        ${s.expiry}<br />
        ${s.ignore}
      </p>
    </div>
  `;

  return sendEmail({ to, subject: s.subject, html, text });
};
