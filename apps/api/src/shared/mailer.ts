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
// Aquí hi ha quins textos porta cada correu i qui l'envia; els textos són al
// catàleg `email` de @sequence-arasaac/i18n i la cara que fan, a `emailLayout.ts`.

import { Resend } from "resend";
import { env } from "../config/env";
import type { LangsApp } from "@sequence-arasaac/shared-types";
import { DEFAULT_LANGS_APP } from "@sequence-arasaac/i18n";
import { createTranslator } from "@sequence-arasaac/i18n/server";
import type { EmailMessageKey } from "@sequence-arasaac/i18n/server";
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
// Els textos són al catàleg `email` de @sequence-arasaac/i18n (vegeu ADR-004);
// aquí només hi ha quines claus fa servir cada correu. Les claus són tipades:
// una de mal escrita, o una que s'ha esborrat del catàleg, no compila.
//
// Tots tres correus tenen la mateixa forma perquè els tres fan el mateix:
// donen context, porten a una acció i diuen per què han arribat. El `reason`
// no és decoració —és el que separa un correu transaccional legítim d'un que
// no s'ha demanat, i el que evita que qui no l'esperava el marqui com a brossa.
interface ActionEmailKeys {
  subject: EmailMessageKey;
  preheader: EmailMessageKey;
  heading: EmailMessageKey;
  body: EmailMessageKey[];
  buttonLabel: EmailMessageKey;
  footnotes: EmailMessageKey[];
  reason: EmailMessageKey;
}

// El nom el fa arribar l'usuari al registre: pot venir buit o ser tot espais.
const cleanName = (name?: string): string | undefined => {
  const trimmed = name?.trim();
  return trimmed ? trimmed : undefined;
};

const VERIFICATION_KEYS: ActionEmailKeys = {
  subject: "email.verification.subject",
  preheader: "email.verification.preheader",
  heading: "email.verification.heading",
  body: ["email.verification.body.1", "email.verification.body.2"],
  buttonLabel: "email.verification.buttonLabel",
  footnotes: ["email.verification.footnote.1", "email.verification.footnote.2"],
  reason: "email.verification.reason",
};

const ACCOUNT_EXISTS_KEYS: ActionEmailKeys = {
  subject: "email.accountExists.subject",
  preheader: "email.accountExists.preheader",
  heading: "email.accountExists.heading",
  body: [
    "email.accountExists.body.1",
    "email.accountExists.body.2",
    "email.accountExists.body.3",
  ],
  buttonLabel: "email.accountExists.buttonLabel",
  footnotes: ["email.accountExists.footnote.1"],
  reason: "email.accountExists.reason",
};

const PASSWORD_RESET_KEYS: ActionEmailKeys = {
  subject: "email.passwordReset.subject",
  preheader: "email.passwordReset.preheader",
  heading: "email.passwordReset.heading",
  body: ["email.passwordReset.body.1", "email.passwordReset.body.2"],
  buttonLabel: "email.passwordReset.buttonLabel",
  footnotes: ["email.passwordReset.footnote.1", "email.passwordReset.footnote.2"],
  reason: "email.passwordReset.reason",
};

// Envia un dels tres correus amb enllaç. Els tres tenen la mateixa estructura,
// així que en tenen una de sola: el que canvia és el joc de claus.
const sendActionEmail = async (
  keys: ActionEmailKeys,
  to: string,
  name: string | undefined,
  url: string,
  locale: LangsApp
): Promise<MailResult> => {
  const t = createTranslator(locale);
  const cleaned = cleanName(name);

  // El nom hi va perquè qui rep el correu pugui reconèixer que és seu d'una
  // ullada: és el senyal que distingeix un correu de debò d'una imitació, que
  // només coneix l'adreça. Va al cos i no a l'assumpte —l'assumpte identifica
  // el fil i no ha de canviar segons qui el rebi.
  const { html, text } = renderEmail({
    locale,
    preheader: t(keys.preheader),
    heading: t(keys.heading),
    greeting: t("email.greeting", {
      hasName: cleaned ? "yes" : "no",
      name: cleaned ?? "",
    }),
    paragraphs: keys.body.map((key) => t(key)),
    action: { url, label: t(keys.buttonLabel) },
    footnotes: keys.footnotes.map((key) => t(key)),
    reason: t(keys.reason),
  });

  return sendEmail({ to, subject: t(keys.subject), html, text });
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
  sendActionEmail(VERIFICATION_KEYS, to, name, verificationUrl, locale);

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
  sendActionEmail(ACCOUNT_EXISTS_KEYS, to, name, resetUrl, locale);

// Correu de recuperació de contrasenya. Mateixa plantilla que el de
// verificació però sense to de benvinguda: aquí ja hi ha un compte fet servir.
export const sendPasswordResetEmail = async (
  to: string,
  name: string | undefined,
  resetUrl: string,
  locale: LangsApp = DEFAULT_LANGS_APP
): Promise<MailResult> =>
  sendActionEmail(PASSWORD_RESET_KEYS, to, name, resetUrl, locale);

interface ClientErrorAlert {
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  emailCanonical?: string;
}

// Avís intern quan un usuari topa amb un error que no s'ha resolt sol.
// Va en català i amb els textos aquí mateix, fora del catàleg: el llegeix una
// sola persona i no es tradueix. Porta la mateixa plantilla que la
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
