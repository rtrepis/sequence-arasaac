// Proves de la plantilla de correu.
//
// El que es prova aquí és el que no es veu mirant un correu que ha sortit bé:
// que el contingut de fora s'escapa, que la versió de text pla diu el mateix
// que la HTML i que l'enllaç hi és encara que el botó no funcioni.

import { describe, it, expect } from "vitest";
import { escapeHtml, renderEmail } from "./emailLayout";

const URL = "https://example.test/set-password?token=abc&lang=ca";

const baseContent = {
  locale: "ca" as const,
  preheader: "Confirma aquesta adreça.",
  heading: "Et donem la benvinguda",
  greeting: "Hola!",
  paragraphs: ["Gràcies per crear un compte."],
  reason: "Reps aquest correu perquè s'ha creat un compte.",
};

describe("escapeHtml", () => {
  it("escapa el marcatge i les cometes", () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe(
      "&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;"
    );
  });
});

describe("renderEmail", () => {
  it("no deixa passar marcatge del nom de l'usuari", () => {
    const { html } = renderEmail({
      ...baseContent,
      greeting: "Hola, <img src=x onerror=alert(1)>!",
    });

    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("porta l'enllaç al botó i també en text, a totes dues versions", () => {
    const { html, text } = renderEmail({
      ...baseContent,
      action: { url: URL, label: "Confirma" },
    });

    // A l'HTML l'URL va a l'href i escapat: un & cru trencaria el document
    expect(html).toContain(`href="https://example.test/set-password?token=abc&amp;lang=ca"`);
    // I visible, perquè un botó que no es pot prémer ha de deixar-se copiar
    expect(html).toContain("&amp;lang=ca</a>");
    // A la versió de text, sense escapar: allà no hi ha cap document
    expect(text).toContain(URL);
  });

  it("posa el text de previsualització fora de la vista", () => {
    const { html } = renderEmail(baseContent);

    expect(html).toContain("display:none");
    expect(html).toContain(baseContent.preheader);
  });

  it("diu sempre per què ha arribat el correu, en totes dues versions", () => {
    const { html, text } = renderEmail(baseContent);

    // A l'HTML hi va escapat (l'apòstrof inclòs); a la versió de text, tal qual
    expect(html).toContain(escapeHtml(baseContent.reason));
    expect(text).toContain(baseContent.reason);
  });

  it("no deixa cap marcatge a la versió de text", () => {
    const { text } = renderEmail({
      ...baseContent,
      action: { url: URL, label: "Confirma" },
      footnotes: ["L'enllaç caduca d'aquí a 24 hores."],
      detailRows: [{ label: "Codi", value: "MAIL_SEND_FAILED" }],
    });

    expect(text).not.toMatch(/<[a-z/]/i);
  });

  it("declara l'idioma del document", () => {
    expect(renderEmail({ ...baseContent, locale: "fr" }).html).toContain('lang="fr"');
  });
});
