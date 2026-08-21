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

// Envia un correu. Retorna si s'ha pogut lliurar al proveïdor.
const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<boolean> => {
  const client = getClient();

  // Sense credencials (desenvolupament) el correu surt per consola.
  // Permet provar el flux sencer sense gastar la quota diària de Resend.
  if (!client) {
    console.log("\n--- Correu no enviat (sense RESEND_API_KEY) ---");
    console.log(`Per a:   ${to}`);
    console.log(`Assumpte: ${subject}`);
    console.log(text);
    console.log("--- fi del correu ---\n");
    return true;
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
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en enviar el correu:", error);
    return false;
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
): Promise<boolean> => {
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

// Cos del correu de benvinguda + verificació. Text pla i HTML mínim a propòsit:
// arriba millor a la safata d'entrada i es llegeix igual en qualsevol client.
//
// Dues parts diferenciades: una de benvinguda (el compte ja existeix, encara no
// es pot fer servir) i una d'acció (el botó porta a triar la contrasenya). Sense
// contrasenya no hi ha compte operatiu, així que aquest enllaç no és opcional.
export const sendVerificationEmail = async (
  to: string,
  name: string | undefined,
  verificationUrl: string
): Promise<boolean> => {
  const subject = "Benvingut/da a SequenciAAC — confirma el teu compte";
  const greeting = name ? `Hola, ${name}!` : "Hola!";

  const text = [
    greeting,
    "",
    "Gràcies per crear un compte a SequenciAAC.",
    "",
    "Per acabar-lo de configurar i triar la teva contrasenya, confirma aquesta adreça:",
    verificationUrl,
    "",
    "L'enllaç caduca d'aquí a 24 hores.",
    "Si no has estat tu qui ha creat el compte, pots ignorar aquest missatge.",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5; color: #1E2A12;">
      <p>${greeting}</p>
      <p>Gràcies per crear un compte a <strong>SequenciAAC</strong>.</p>
      <p>Per acabar-lo de configurar i triar la teva contrasenya, confirma aquesta adreça:</p>
      ${actionButton(verificationUrl, "Confirma i tria la contrasenya")}
      <p style="font-size: 14px; color: #555;">
        L'enllaç caduca d'aquí a 24 hores.<br />
        Si no has estat tu qui ha creat el compte, pots ignorar aquest missatge.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html, text });
};

// Cos del correu de recuperació de contrasenya. Mateix estil que el de
// verificació però sense to de benvinguda: aquí ja hi ha un compte fet servir.
export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string
): Promise<boolean> => {
  const subject = "Recupera la teva contrasenya — SequenciAAC";

  const text = [
    "Hola!",
    "",
    "Hem rebut una petició per canviar la contrasenya del teu compte a SequenciAAC.",
    "Per triar-ne una de nova, obre aquest enllaç:",
    resetUrl,
    "",
    "L'enllaç caduca d'aquí a 1 hora.",
    "Si no has estat tu qui ho ha demanat, pots ignorar aquest missatge: la teva contrasenya actual continua funcionant.",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5; color: #1E2A12;">
      <p>Hola!</p>
      <p>Hem rebut una petició per canviar la contrasenya del teu compte a <strong>SequenciAAC</strong>.</p>
      <p>Per triar-ne una de nova, obre aquest enllaç:</p>
      ${actionButton(resetUrl, "Tria una contrasenya nova")}
      <p style="font-size: 14px; color: #555;">
        L'enllaç caduca d'aquí a 1 hora.<br />
        Si no has estat tu qui ho ha demanat, pots ignorar aquest missatge: la teva contrasenya actual continua funcionant.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html, text });
};
