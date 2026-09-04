// Enviament de correu transaccional
//
// Embolcall prim sobre Resend: és l'únic fitxer del projecte que sap quin
// proveïdor de correu es fa servir. Canviar-lo no ha de tocar res més.
//
// Cap funció d'aquest mòdul llança mai. El correu és un canal que falla sol
// (quota diària esgotada, incidència del proveïdor, domini no verificat) i cap
// d'aquestes coses pot impedir que un usuari es doni d'alta. Qui crida aquestes
// funcions rep un boolean i decideix què n'explica a l'usuari.
//
// Aquí hi ha els textos i qui els envia; la cara que fan és a `emailLayout.ts`.

import { Resend } from "resend";
import { env } from "../config/env";
import type { LangsApp } from "@sequence-arasaac/shared-types";
import { DEFAULT_LANGS_APP } from "./langsApp";
import { renderEmail, type EmailDetailRow } from "./emailLayout";

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
//
// Sempre en dues versions: la HTML i la de text pla. La segona no és cap
// resta —és el que llegeixen els clients en mode text, els rellotges i els
// lectors de pantalla que no volen marcatge—, i a més un correu amb les dues
// parts arriba millor a la safata d'entrada que un que només porta HTML.
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

// --- Textos ---
//
// Un joc complet per idioma i per correu. Cap altra part del fitxer coneix cap
// literal traduïble: tot passa per aquí.
//
// Tots tres correus tenen la mateixa forma perquè els tres fan el mateix:
// donen context, porten a una acció i diuen per què han arribat. El `reason`
// no és decoració —és el que separa un correu transaccional legítim d'un que
// no s'ha demanat, i el que evita que qui no l'esperava el marqui com a brossa.
interface ActionEmailStrings {
  subject: string;
  preheader: string;
  heading: string;
  greeting: (name?: string) => string;
  body: string[];
  buttonLabel: string;
  footnotes: string[];
  reason: string;
}

// El nom el fa arribar l'usuari al registre: pot venir buit o ser tot espais.
const cleanName = (name?: string): string | undefined => {
  const trimmed = name?.trim();
  return trimmed ? trimmed : undefined;
};

const VERIFICATION_STRINGS: Record<LangsApp, ActionEmailStrings> = {
  ca: {
    subject: "Benvingut/da a SequenciAAC — confirma el teu compte",
    preheader: "Confirma aquesta adreça i tria la teva contrasenya.",
    heading: "Et donem la benvinguda",
    greeting: (name) => (name ? `Hola, ${name}!` : "Hola!"),
    body: [
      "Gràcies per crear un compte a SequenciAAC.",
      "Per acabar-lo de configurar i triar la teva contrasenya, confirma aquesta adreça:",
    ],
    buttonLabel: "Confirma i tria la contrasenya",
    footnotes: [
      "L'enllaç caduca d'aquí a 24 hores.",
      "Si no has estat tu qui ha creat el compte, pots ignorar aquest missatge.",
    ],
    reason: "Reps aquest correu perquè s'ha creat un compte a SequenciAAC amb aquesta adreça.",
  },
  es: {
    subject: "Bienvenido/a a SequenciAAC — confirma tu cuenta",
    preheader: "Confirma esta dirección y elige tu contraseña.",
    heading: "Te damos la bienvenida",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    body: [
      "Gracias por crear una cuenta en SequenciAAC.",
      "Para acabar de configurarla y elegir tu contraseña, confirma esta dirección:",
    ],
    buttonLabel: "Confirma y elige la contraseña",
    footnotes: [
      "El enlace caduca dentro de 24 horas.",
      "Si no has sido tú quien ha creado la cuenta, puedes ignorar este mensaje.",
    ],
    reason: "Recibes este correo porque se ha creado una cuenta en SequenciAAC con esta dirección.",
  },
  en: {
    subject: "Welcome to SequenciAAC — confirm your account",
    preheader: "Confirm this address and choose your password.",
    heading: "Welcome aboard",
    greeting: (name) => (name ? `Hi, ${name}!` : "Hi!"),
    body: [
      "Thanks for creating an account on SequenciAAC.",
      "To finish setting it up and choose your password, confirm this address:",
    ],
    buttonLabel: "Confirm and choose password",
    footnotes: [
      "The link expires in 24 hours.",
      "If you didn't create this account, you can ignore this message.",
    ],
    reason: "You're receiving this email because an account was created on SequenciAAC with this address.",
  },
  fr: {
    subject: "Bienvenue sur SequenciAAC — confirmez votre compte",
    preheader: "Confirmez cette adresse et choisissez votre mot de passe.",
    heading: "Bienvenue",
    greeting: (name) => (name ? `Bonjour, ${name} !` : "Bonjour !"),
    body: [
      "Merci d'avoir créé un compte sur SequenciAAC.",
      "Pour terminer sa configuration et choisir votre mot de passe, confirmez cette adresse :",
    ],
    buttonLabel: "Confirmer et choisir le mot de passe",
    footnotes: [
      "Le lien expire dans 24 heures.",
      "Si vous n'êtes pas à l'origine de la création de ce compte, vous pouvez ignorer ce message.",
    ],
    reason: "Vous recevez cet e-mail parce qu'un compte a été créé sur SequenciAAC avec cette adresse.",
  },
  it: {
    subject: "Benvenuto/a su SequenciAAC — conferma il tuo account",
    preheader: "Conferma questo indirizzo e scegli la tua password.",
    heading: "Ti diamo il benvenuto",
    greeting: (name) => (name ? `Ciao, ${name}!` : "Ciao!"),
    body: [
      "Grazie per aver creato un account su SequenciAAC.",
      "Per completare la configurazione e scegliere la password, conferma questo indirizzo:",
    ],
    buttonLabel: "Conferma e scegli la password",
    footnotes: [
      "Il link scade tra 24 ore.",
      "Se non sei stato tu a creare l'account, puoi ignorare questo messaggio.",
    ],
    reason: "Ricevi questa email perché è stato creato un account su SequenciAAC con questo indirizzo.",
  },
};

const ACCOUNT_EXISTS_STRINGS: Record<LangsApp, ActionEmailStrings> = {
  ca: {
    subject: "Algú ha intentat crear un compte amb aquest correu — SequenciAAC",
    preheader: "No s'ha creat cap compte nou ni s'ha canviat res del teu.",
    heading: "Ja tens un compte",
    greeting: (name) => (name ? `Hola, ${name}!` : "Hola!"),
    body: [
      "Algú ha intentat crear un compte a SequenciAAC amb aquesta adreça, però ja en tens un.",
      "Si no has estat tu, pots ignorar aquest missatge: no s'ha canviat res del teu compte.",
      "Si has estat tu i no recordes la contrasenya, pots triar-ne una de nova aquí:",
    ],
    buttonLabel: "Tria una contrasenya nova",
    footnotes: ["L'enllaç caduca d'aquí a 1 hora."],
    reason: "Reps aquest correu perquè algú ha provat de crear un compte amb aquesta adreça.",
  },
  es: {
    subject: "Alguien ha intentado crear una cuenta con este correo — SequenciAAC",
    preheader: "No se ha creado ninguna cuenta nueva ni se ha cambiado nada.",
    heading: "Ya tienes una cuenta",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    body: [
      "Alguien ha intentado crear una cuenta en SequenciAAC con esta dirección, pero ya tienes una.",
      "Si no has sido tú, puedes ignorar este mensaje: no se ha cambiado nada en tu cuenta.",
      "Si has sido tú y no recuerdas la contraseña, puedes elegir una nueva aquí:",
    ],
    buttonLabel: "Elige una contraseña nueva",
    footnotes: ["El enlace caduca dentro de 1 hora."],
    reason: "Recibes este correo porque alguien ha intentado crear una cuenta con esta dirección.",
  },
  en: {
    subject: "Someone tried to create an account with this email — SequenciAAC",
    preheader: "No new account was created and nothing changed on yours.",
    heading: "You already have an account",
    greeting: (name) => (name ? `Hi, ${name}!` : "Hi!"),
    body: [
      "Someone tried to create an account on SequenciAAC with this address, but you already have one.",
      "If it wasn't you, you can ignore this message: nothing has changed on your account.",
      "If it was you and you don't remember the password, you can choose a new one here:",
    ],
    buttonLabel: "Choose a new password",
    footnotes: ["The link expires in 1 hour."],
    reason: "You're receiving this email because someone tried to create an account with this address.",
  },
  fr: {
    subject: "Quelqu'un a essayé de créer un compte avec cet e-mail — SequenciAAC",
    preheader: "Aucun nouveau compte n'a été créé et rien n'a changé sur le vôtre.",
    heading: "Vous avez déjà un compte",
    greeting: (name) => (name ? `Bonjour, ${name} !` : "Bonjour !"),
    body: [
      "Quelqu'un a essayé de créer un compte sur SequenciAAC avec cette adresse, mais vous en avez déjà un.",
      "Si ce n'était pas vous, vous pouvez ignorer ce message : rien n'a changé sur votre compte.",
      "Si c'était vous et que vous ne vous souvenez plus du mot de passe, vous pouvez en choisir un nouveau ici :",
    ],
    buttonLabel: "Choisir un nouveau mot de passe",
    footnotes: ["Le lien expire dans 1 heure."],
    reason: "Vous recevez cet e-mail parce que quelqu'un a essayé de créer un compte avec cette adresse.",
  },
  it: {
    subject: "Qualcuno ha provato a creare un account con questa email — SequenciAAC",
    preheader: "Non è stato creato nessun nuovo account e nulla è cambiato nel tuo.",
    heading: "Hai già un account",
    greeting: (name) => (name ? `Ciao, ${name}!` : "Ciao!"),
    body: [
      "Qualcuno ha provato a creare un account su SequenciAAC con questo indirizzo, ma ne hai già uno.",
      "Se non sei stato tu, puoi ignorare questo messaggio: non è cambiato nulla nel tuo account.",
      "Se sei stato tu e non ricordi la password, puoi sceglierne una nuova qui:",
    ],
    buttonLabel: "Scegli una nuova password",
    footnotes: ["Il link scade tra 1 ora."],
    reason: "Ricevi questa email perché qualcuno ha provato a creare un account con questo indirizzo.",
  },
};

const PASSWORD_RESET_STRINGS: Record<LangsApp, ActionEmailStrings> = {
  ca: {
    subject: "Recupera la teva contrasenya — SequenciAAC",
    preheader: "Enllaç per triar una contrasenya nova. Caduca d'aquí a 1 hora.",
    heading: "Recupera la contrasenya",
    greeting: (name) => (name ? `Hola, ${name}!` : "Hola!"),
    body: [
      "Hem rebut una petició per canviar la contrasenya del teu compte a SequenciAAC.",
      "Per triar-ne una de nova, obre aquest enllaç:",
    ],
    buttonLabel: "Tria una contrasenya nova",
    footnotes: [
      "L'enllaç caduca d'aquí a 1 hora.",
      "Si no has estat tu qui ho ha demanat, pots ignorar aquest missatge: la teva contrasenya actual continua funcionant.",
    ],
    reason: "Reps aquest correu perquè s'ha demanat un canvi de contrasenya per a aquest compte.",
  },
  es: {
    subject: "Recupera tu contraseña — SequenciAAC",
    preheader: "Enlace para elegir una contraseña nueva. Caduca dentro de 1 hora.",
    heading: "Recupera la contraseña",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    body: [
      "Hemos recibido una petición para cambiar la contraseña de tu cuenta en SequenciAAC.",
      "Para elegir una nueva, abre este enlace:",
    ],
    buttonLabel: "Elige una contraseña nueva",
    footnotes: [
      "El enlace caduca dentro de 1 hora.",
      "Si no has sido tú quien lo ha pedido, puedes ignorar este mensaje: tu contraseña actual sigue funcionando.",
    ],
    reason: "Recibes este correo porque se ha pedido un cambio de contraseña para esta cuenta.",
  },
  en: {
    subject: "Reset your password — SequenciAAC",
    preheader: "Link to choose a new password. It expires in 1 hour.",
    heading: "Reset your password",
    greeting: (name) => (name ? `Hi, ${name}!` : "Hi!"),
    body: [
      "We received a request to change the password for your SequenciAAC account.",
      "To choose a new one, open this link:",
    ],
    buttonLabel: "Choose a new password",
    footnotes: [
      "The link expires in 1 hour.",
      "If you didn't request this, you can ignore this message: your current password still works.",
    ],
    reason: "You're receiving this email because a password change was requested for this account.",
  },
  fr: {
    subject: "Récupérez votre mot de passe — SequenciAAC",
    preheader: "Lien pour choisir un nouveau mot de passe. Il expire dans 1 heure.",
    heading: "Récupérez votre mot de passe",
    greeting: (name) => (name ? `Bonjour, ${name} !` : "Bonjour !"),
    body: [
      "Nous avons reçu une demande de changement du mot de passe de votre compte SequenciAAC.",
      "Pour en choisir un nouveau, ouvrez ce lien :",
    ],
    buttonLabel: "Choisir un nouveau mot de passe",
    footnotes: [
      "Le lien expire dans 1 heure.",
      "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message : votre mot de passe actuel continue de fonctionner.",
    ],
    reason: "Vous recevez cet e-mail parce qu'un changement de mot de passe a été demandé pour ce compte.",
  },
  it: {
    subject: "Recupera la tua password — SequenciAAC",
    preheader: "Link per scegliere una nuova password. Scade tra 1 ora.",
    heading: "Recupera la password",
    greeting: (name) => (name ? `Ciao, ${name}!` : "Ciao!"),
    body: [
      "Abbiamo ricevuto una richiesta di cambio password per il tuo account SequenciAAC.",
      "Per sceglierne una nuova, apri questo link:",
    ],
    buttonLabel: "Scegli una nuova password",
    footnotes: [
      "Il link scade tra 1 ora.",
      "Se non sei stato tu a richiederlo, puoi ignorare questo messaggio: la tua password attuale continua a funzionare.",
    ],
    reason: "Ricevi questa email perché è stato richiesto un cambio di password per questo account.",
  },
};

// Envia un dels tres correus amb enllaç. Els tres tenen la mateixa estructura,
// així que en tenen una de sola: el que canvia és el joc de textos.
const sendActionEmail = async (
  strings: Record<LangsApp, ActionEmailStrings>,
  to: string,
  name: string | undefined,
  url: string,
  locale: LangsApp
): Promise<MailResult> => {
  const s = strings[locale] ?? strings[DEFAULT_LANGS_APP];
  const safeLocale = strings[locale] ? locale : DEFAULT_LANGS_APP;

  // El nom hi va perquè qui rep el correu pugui reconèixer que és seu d'una
  // ullada: és el senyal que distingeix un correu de debò d'una imitació, que
  // només coneix l'adreça. Va al cos i no a l'assumpte —l'assumpte identifica
  // el fil i no ha de canviar segons qui el rebi.
  const { html, text } = renderEmail({
    locale: safeLocale,
    preheader: s.preheader,
    heading: s.heading,
    greeting: s.greeting(cleanName(name)),
    paragraphs: s.body,
    action: { url, label: s.buttonLabel },
    footnotes: s.footnotes,
    reason: s.reason,
  });

  return sendEmail({ to, subject: s.subject, html, text });
};

// Correu de benvinguda + verificació.
//
// Dues parts diferenciades: una de benvinguda (el compte ja existeix, encara no
// es pot fer servir) i una d'acció (el botó porta a triar la contrasenya). Sense
// contrasenya no hi ha compte operatiu, així que aquest enllaç no és opcional.
export const sendVerificationEmail = async (
  to: string,
  name: string | undefined,
  verificationUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> =>
  sendActionEmail(VERIFICATION_STRINGS, to, name, verificationUrl, locale);

// Avís quan algú intenta un signup amb un correu que ja té compte.
// No diu "aquest correu ja existeix" enlloc de l'aplicació —això revelaria
// comptes a qui prova adreces a l'atzar—; l'avís només arriba a la bústia
// real, que és qui de debò necessita saber-ho. Cobreix els dos casos possibles
// sense distingir-los: no ha estat l'usuari (ignora-ho) o sí (aquí tens l'enllaç).
export const sendAccountExistsEmail = async (
  to: string,
  name: string | undefined,
  resetUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> =>
  sendActionEmail(ACCOUNT_EXISTS_STRINGS, to, name, resetUrl, locale);

// Correu de recuperació de contrasenya. Mateixa plantilla que el de
// verificació però sense to de benvinguda: aquí ja hi ha un compte fet servir.
export const sendPasswordResetEmail = async (
  to: string,
  name: string | undefined,
  resetUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> =>
  sendActionEmail(PASSWORD_RESET_STRINGS, to, name, resetUrl, locale);

interface ClientErrorAlert {
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  emailCanonical?: string;
}

// Avís intern quan un usuari topa amb un error que no s'ha resolt sol.
// Va en català: el llegeix una sola persona. Porta la mateixa plantilla que la
// resta —arriba a la mateixa safata i s'ha de reconèixer igual de ràpid—, amb
// les dades en una taula perquè el codi i el context es vegin de seguida.
export const sendClientErrorAlert = async (
  to: string,
  { code, context, detail, userAgent, emailCanonical }: ClientErrorAlert
): Promise<MailResult> => {
  const subject = `[SequenciAAC] Error a ${context}: ${code}`;

  const detailRows: EmailDetailRow[] = [
    { label: "Codi", value: code },
    { label: "On", value: context },
    { label: "Quan", value: new Date().toISOString() },
    { label: "Usuari", value: emailCanonical ?? "(sense sessió)" },
    { label: "Detall", value: detail ?? "(cap)" },
    { label: "Navegador", value: userAgent ?? "(desconegut)" },
  ];

  const { html, text } = renderEmail({
    locale: DEFAULT_LANGS_APP,
    preheader: `${code} a ${context}`,
    heading: "Un usuari ha vist un error",
    greeting: "Hola!",
    paragraphs: ["Aquest error ha arribat a la pantalla d'algú que feia servir l'aplicació."],
    detailRows,
    footnotes: [
      "Els errors passatgers (servei engegant-se, connexió intermitent) no arriben aquí: només els que l'usuari ha acabat veient per pantalla.",
      "No en rebràs cap altre d'aquest mateix codi durant una hora.",
    ],
    reason: "Avís intern del registre d'errors de SequenciAAC.",
  });

  return sendEmail({ to, subject, html, text });
};
