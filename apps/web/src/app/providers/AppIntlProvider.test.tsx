import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { FormattedMessage } from "react-intl";
import ca from "@sequence-arasaac/i18n/messages/app/ca.json";
import AppIntlProvider from "./AppIntlProvider";

describe("AppIntlProvider", () => {
  it("carrega el catàleg de l'idioma demanat", async () => {
    render(
      <AppIntlProvider locale="fr" defaultLocale="es">
        <FormattedMessage id="changelog.category.nova" defaultMessage="New" />
      </AppIntlProvider>,
    );
    expect(await screen.findByText("Nouveau")).toBeInTheDocument();
  });

  it("amb un locale que no és de l'aplicació cau al defaultMessage", () => {
    render(
      <AppIntlProvider locale="de" defaultLocale="es">
        <FormattedMessage id="changelog.category.nova" defaultMessage="New" />
      </AppIntlProvider>,
    );
    expect(screen.getByText("New")).toBeInTheDocument();
  });
});

// Cada id que el codi declara (defineMessages, FormattedMessage…) ha de ser al
// catàleg font. Els que es construeixen en temps d'execució (`error.${codi}`)
// no es poden extreure i no entren aquí.
describe("ids de missatge", () => {
  it("cada id del codi existeix a app/ca.json", () => {
    const outDir = mkdtempSync(join(tmpdir(), "formatjs-"));
    const outFile = join(outDir, "extracted.json");
    try {
      // El CLI es resol com a paquet perquè npm el pot haver pujat a l'arrel
      const cli = require.resolve("@formatjs/cli/bin/formatjs");
      execFileSync(
        process.execPath,
        [
          cli,
          "extract",
          "src/**/*.ts*",
          "--ignore",
          "**/*.d.ts",
          "--ignore",
          "**/*.test.ts*",
          "--out-file",
          outFile,
        ],
        { cwd: join(__dirname, "../../.."), stdio: "pipe" },
      );
      const extracted = JSON.parse(readFileSync(outFile, "utf8")) as Record<string, unknown>;
      const missing = Object.keys(extracted).filter((id) => !(id in ca));
      expect(missing).toEqual([]);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});
