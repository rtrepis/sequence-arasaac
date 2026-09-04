// Plantilla única de tots els correus de SequenciAAC
//
// Aquest fitxer és a la capa de correu el que `palette.ts` és al front: l'únic
// lloc on es decideix quina cara fa un correu de l'aplicació. `mailer.ts` sap
// quin proveïdor l'envia i quins textos porta; aquest sap com es dibuixa. Cap
// altre fitxer escriu HTML de correu.
//
// El contingut arriba sempre en **text pla** i el rendering l'escapa sencer:
// el nom de l'usuari i el detall d'un error són text que ha escrit algú de fora
// i acaben dins d'un document HTML. Amb això, injectar-hi marcatge és
// impossible per construcció, no per haver-se'n recordat a cada crida.
//
// De la mateixa declaració en surten les dues versions, HTML i text pla. És
// deliberat: mantenir-les per separat vol dir que un dia una de les dues dirà
// una cosa diferent de l'altra i ningú se n'assabentarà, perquè la de text la
// llegeix justament qui no pot llegir l'altra.

import type { LangsApp } from "@sequence-arasaac/shared-types";
import { env } from "../config/env";
import { DEFAULT_LANGS_APP } from "./langsApp";

// --- Colors ---
//
// Excepció declarada a la regla de «cap hexadecimal fora de palette.ts»: un
// correu no pot importar el tema de MUI ni carregar cap full d'estil (els
// clients els ignoren o els esborren), així que el color hi va literal i en
// línia. El que sí que es pot fer és tenir-ne un sol lloc a l'API, que és
// aquest, amb els mateixos valors de la paleta del web.
const BRAND_GREEN = "#8ac34a"; // primary.main
const BRAND_INK = "#1E2A12"; // primary.contrastText — text sobre el verd i cos del correu
const PAGE_BG = "#F2F5EC"; // background.paper: l'escriptori sobre el qual sura la targeta
// Blanc trencat i no #FFFFFF pur: el blanc pur és el que dispara la inversió
// més agressiva dels clients en mode fosc, i la diferència no es veu.
const CARD_BG = "#FDFDFB";
const MUTED_INK = "#4A5340"; // lletra petita — 7,7:1 sobre la targeta
const BORDER = "#DCE3D2";

// Forma de la casa (APP_CORNER_RADIUS del front) i diana tàctil mínima:
// el botó fa 48 px d'alt comptant el padding, per damunt dels 44 de WCAG.
const CORNER_RADIUS_PX = 20;
const BUTTON_HEIGHT_PX = 48;
const BUTTON_WIDTH_PX = 320;

// 600 px és l'amplada que cap a la finestra de previsualització de tots els
// clients d'escriptori sense scroll horitzontal.
const CONTENT_WIDTH_PX = 600;

// Pila de fonts del sistema: cap client de correu garanteix cap font web
// (Outlook i Gmail no en carreguen), així que es demana la del dispositiu.
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// La marca al capçal va en PNG i no en SVG: cap client de correu dibuixa SVG.
const LOGO_URL = `${env.APP_PUBLIC_URL}/favicon.png`;
const LOGO_WIDTH_PX = 48;
const LOGO_HEIGHT_PX = 35;

const APP_NAME = "SequenciAAC";

interface LayoutStrings {
  // Motiu de la marca, el mateix que encapçala la pàgina de benvinguda
  tagline: string;
  // Tot correu amb botó porta l'enllaç també en text: els botons es trenquen,
  // es bloquegen i no es poden reenviar per telèfon.
  linkFallback: string;
  logoAlt: string;
}

const LAYOUT_STRINGS: Record<LangsApp, LayoutStrings> = {
  ca: {
    tagline: "Crea i imprimeix o visualitza la teva pàgina de seqüències.",
    linkFallback: "Si el botó no funciona, copia aquest enllaç i enganxa'l al navegador:",
    logoAlt: "Logotip de SequenciAAC",
  },
  es: {
    tagline: "Crea e imprime o ve tu página de secuencia.",
    linkFallback: "Si el botón no funciona, copia este enlace y pégalo en el navegador:",
    logoAlt: "Logotipo de SequenciAAC",
  },
  en: {
    tagline: "Create and print or view your sequence page.",
    linkFallback: "If the button doesn't work, copy this link and paste it into your browser:",
    logoAlt: "SequenciAAC logo",
  },
  fr: {
    tagline: "Créez et imprimez ou visualisez votre page de séquences.",
    linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien et collez-le dans votre navigateur :",
    logoAlt: "Logo de SequenciAAC",
  },
  it: {
    tagline: "Crea e stampa o visualizza la tua pagina di sequenze.",
    linkFallback: "Se il pulsante non funziona, copia questo link e incollalo nel browser:",
    logoAlt: "Logo di SequenciAAC",
  },
};

export interface EmailAction {
  url: string;
  label: string;
}

export interface EmailDetailRow {
  label: string;
  value: string;
}

export interface EmailContent {
  locale: LangsApp;
  // Text de previsualització de la safata d'entrada. Sense ell, el client
  // ensenya el primer text del cos, que aquí seria el nom de la marca repetit.
  preheader: string;
  // Títol del correu, dins del cos (<h1>): diu de què va sense dependre de
  // l'assumpte, que sovint ja no es veu mentre es llegeix.
  heading: string;
  greeting: string;
  paragraphs: string[];
  action?: EmailAction;
  // Lletra petita: caducitat de l'enllaç, què fer si no has estat tu
  footnotes?: string[];
  // Files de dades (només l'avís intern d'error)
  detailRows?: EmailDetailRow[];
  // Per què rep aquest correu qui el rep. Va al peu i no és decoració: és el
  // que distingeix un correu transaccional legítim d'un que no s'ha demanat.
  reason: string;
}

export interface RenderedEmail {
  html: string;
  text: string;
}

// Escapa tot el que va a parar al document: text i valors d'atribut.
// Les cometes hi entren perquè el mateix escapat serveix per a un href.
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const paragraph = (text: string, extra = ""): string =>
  `<p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:1.6;color:${BRAND_INK};${extra}">${escapeHtml(text)}</p>`;

// Botó a prova de client: el color de fons va a la cel·la (Outlook l'ignora a
// l'enllaç) i la versió VML dibuixa la forma arrodonida a l'Outlook
// d'escriptori, que renderitza amb el motor del Word i no coneix border-radius.
const actionButton = (action: EmailAction): string => {
  const url = escapeHtml(action.url);
  const label = escapeHtml(action.label);
  const arcsize = `${Math.round((CORNER_RADIUS_PX / BUTTON_HEIGHT_PX) * 100)}%`;

  return `
      <table role="presentation" class="sq-btn-wrap" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
        <tr>
          <td align="center" bgcolor="${BRAND_GREEN}" style="border-radius:${CORNER_RADIUS_PX}px;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                         href="${url}" style="height:${BUTTON_HEIGHT_PX}px;v-text-anchor:middle;width:${BUTTON_WIDTH_PX}px;"
                         arcsize="${arcsize}" strokecolor="${BRAND_GREEN}" fillcolor="${BRAND_GREEN}">
              <w:anchorlock/>
              <center style="color:${BRAND_INK};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a class="sq-btn" href="${url}"
               style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:16px;font-weight:bold;
                      line-height:20px;color:${BRAND_INK};text-decoration:none;border-radius:${CORNER_RADIUS_PX}px;
                      background-color:${BRAND_GREEN};">${label}</a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>`;
};

const detailTable = (rows: EmailDetailRow[]): string => `
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:8px;background-color:${PAGE_BG};">
        ${rows
          .map(
            ({ label, value }) => `<tr>
          <td style="padding:8px 12px;font-family:${FONT_STACK};font-size:13px;color:${MUTED_INK};white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;font-family:Menlo,Consolas,monospace;font-size:13px;color:${BRAND_INK};word-break:break-word;">${escapeHtml(value)}</td>
        </tr>`
          )
          .join("\n        ")}
      </table>`;

// Espaiadors invisibles darrere del preheader: empenyen fora de la
// previsualització el text que el client hi posaria pel seu compte.
const PREHEADER_SPACER = "&zwnj;&nbsp;".repeat(60);

const renderHtml = (content: EmailContent, s: LayoutStrings): string => {
  const { locale, preheader, heading, greeting, paragraphs, action, footnotes, detailRows, reason } =
    content;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${locale}" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(heading)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type="text/css">
    /* Els estils que aquí no arribin ja van en línia a cada element: aquest
       bloc només porta el que no es pot escriure en línia. */
    body { margin: 0; padding: 0; width: 100% !important; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: ${CONTENT_WIDTH_PX + 20}px) {
      .sq-wrapper { width: 100% !important; }
      .sq-pad { padding: 24px 20px !important; }
      .sq-btn-wrap { width: 100% !important; }
      .sq-btn { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};">
  <div style="display:none;font-size:1px;color:${PAGE_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}${PREHEADER_SPACER}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="sq-wrapper" cellpadding="0" cellspacing="0" border="0" width="${CONTENT_WIDTH_PX}" style="width:${CONTENT_WIDTH_PX}px;max-width:${CONTENT_WIDTH_PX}px;">

          <!-- Capçal: la marca. El nom hi va en text i no dins la imatge,
               perquè el correu s'ha de reconèixer amb les imatges bloquejades. -->
          <tr>
            <td class="sq-pad" align="left" bgcolor="${BRAND_GREEN}"
                style="padding:20px 32px;background-color:${BRAND_GREEN};border-radius:${CORNER_RADIUS_PX}px ${CORNER_RADIUS_PX}px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:middle;">
                    <img src="${escapeHtml(LOGO_URL)}" width="${LOGO_WIDTH_PX}" height="${LOGO_HEIGHT_PX}"
                         alt="${escapeHtml(s.logoAlt)}"
                         style="display:block;width:${LOGO_WIDTH_PX}px;height:${LOGO_HEIGHT_PX}px;color:${BRAND_INK};font-family:${FONT_STACK};font-size:13px;" />
                  </td>
                  <td style="vertical-align:middle;font-family:${FONT_STACK};font-size:22px;font-weight:bold;color:${BRAND_INK};">${APP_NAME}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cos -->
          <tr>
            <td class="sq-pad" style="padding:32px;background-color:${CARD_BG};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <h1 style="margin:0 0 20px;font-family:${FONT_STACK};font-size:22px;line-height:1.3;font-weight:bold;color:${BRAND_INK};">${escapeHtml(heading)}</h1>
              ${paragraph(greeting)}
              ${paragraphs.map((text) => paragraph(text)).join("\n              ")}
              ${detailRows && detailRows.length > 0 ? detailTable(detailRows) : ""}
              ${action ? actionButton(action) : ""}
              ${
                action
                  ? `<p style="margin:0 0 8px;font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:${MUTED_INK};">${escapeHtml(s.linkFallback)}</p>
              <p style="margin:0 0 20px;font-family:${FONT_STACK};font-size:13px;line-height:1.5;word-break:break-all;"><a href="${escapeHtml(action.url)}" style="color:#496628;">${escapeHtml(action.url)}</a></p>`
                  : ""
              }
              ${
                footnotes && footnotes.length > 0
                  ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${BORDER};margin-top:8px;">
                <tr><td style="padding-top:16px;">
                  ${footnotes
                    .map(
                      (note) =>
                        `<p style="margin:0 0 8px;font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:${MUTED_INK};">${escapeHtml(note)}</p>`
                    )
                    .join("\n                  ")}
                </td></tr>
              </table>`
                  : ""
              }
            </td>
          </tr>

          <!-- Peu: qui escriu i per què -->
          <tr>
            <td class="sq-pad" style="padding:20px 32px;background-color:${PAGE_BG};border:1px solid ${BORDER};border-top:0;border-radius:0 0 ${CORNER_RADIUS_PX}px ${CORNER_RADIUS_PX}px;">
              <p style="margin:0 0 6px;font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:${MUTED_INK};">${escapeHtml(s.tagline)}</p>
              <p style="margin:0 0 6px;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${MUTED_INK};">${escapeHtml(reason)}</p>
              <p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${MUTED_INK};">
                <a href="${escapeHtml(env.APP_PUBLIC_URL)}" style="color:#496628;text-decoration:underline;">${APP_NAME}</a>
                &nbsp;·&nbsp; © ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const renderText = (content: EmailContent, s: LayoutStrings): string => {
  const { heading, greeting, paragraphs, action, footnotes, detailRows, reason } = content;

  const lines: string[] = [APP_NAME, s.tagline, "", heading.toUpperCase(), "", greeting, ""];

  paragraphs.forEach((text) => lines.push(text, ""));

  if (detailRows && detailRows.length > 0) {
    detailRows.forEach(({ label, value }) => lines.push(`${label} ${value}`));
    lines.push("");
  }

  if (action) {
    lines.push(`${action.label}:`, action.url, "");
  }

  if (footnotes && footnotes.length > 0) {
    footnotes.forEach((note) => lines.push(note));
    lines.push("");
  }

  lines.push("--", reason, `${APP_NAME} — ${env.APP_PUBLIC_URL}`);

  return lines.join("\n");
};

// Dibuixa un correu complet a partir del seu contingut, en HTML i en text pla.
export const renderEmail = (content: EmailContent): RenderedEmail => {
  const s = LAYOUT_STRINGS[content.locale] ?? LAYOUT_STRINGS[DEFAULT_LANGS_APP];

  return { html: renderHtml(content, s), text: renderText(content, s) };
};
