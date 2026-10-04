// Xarxa de seguretat de les traduccions (ADR-004, decisió 10). Substitueix el
// compilador i Crowdin: si falla, diu la clau i l'idioma que cal arreglar.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse, TYPE } from "@formatjs/icu-messageformat-parser";
import type { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { DEFAULT_LANGS_APP, LANGS_APP } from "./locales";
import { toMessages } from "./catalog";
import type { SourceCatalog, TranslationCatalog } from "./catalog";

const MESSAGES_DIR = join(__dirname, "..", "messages");

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));

// Noms de les variables i etiquetes d'un text ICU, per comparar-les entre idiomes
const collectArguments = (elements: MessageFormatElement[], names: Set<string>): Set<string> => {
  for (const element of elements) {
    if (element.type === TYPE.tag) {
      names.add(`<${element.value}>`);
      collectArguments(element.children, names);
    } else if (
      element.type === TYPE.argument ||
      element.type === TYPE.number ||
      element.type === TYPE.date ||
      element.type === TYPE.time
    ) {
      names.add(element.value);
    } else if (element.type === TYPE.select || element.type === TYPE.plural) {
      names.add(element.value);
      for (const option of Object.values(element.options)) {
        collectArguments(option.value, names);
      }
    }
  }
  return names;
};

const argumentsOf = (message: string): string[] =>
  [...collectArguments(parse(message), new Set<string>())].sort();

const namespaces = readdirSync(MESSAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe.each(namespaces)("catàleg «%s»", (namespace) => {
  const fileOf = (lang: string): string => join(MESSAGES_DIR, namespace, `${lang}.json`);
  const source = readJson(fileOf(DEFAULT_LANGS_APP)) as SourceCatalog;
  const sourceKeys = Object.keys(source).sort();
  const sourceMessages = toMessages(source);

  it("no hi ha fitxers d'idiomes que no siguin de l'aplicació", () => {
    const files = readdirSync(join(MESSAGES_DIR, namespace)).filter((f) => f.endsWith(".json"));
    expect(files.map((f) => f.replace(/\.json$/, "")).sort()).toEqual([...LANGS_APP].sort());
  });

  it("l'idioma font té text a cada entrada", () => {
    const invalid = sourceKeys.filter((key) => typeof source[key]?.message !== "string");
    expect(invalid).toEqual([]);
  });

  describe.each(LANGS_APP.filter((lang) => lang !== DEFAULT_LANGS_APP))("%s", (lang) => {
    const translation = readJson(fileOf(lang)) as TranslationCatalog;

    it("té exactament les claus de l'idioma font", () => {
      const keys = Object.keys(translation);
      expect({
        falten: sourceKeys.filter((key) => !(key in translation)),
        sobren: keys.filter((key) => !(key in source)),
      }).toEqual({ falten: [], sobren: [] });
    });

    it("cada entrada és un text", () => {
      const invalid = Object.keys(translation).filter((key) => typeof translation[key] !== "string");
      expect(invalid).toEqual([]);
    });

    it("usa les mateixes variables que l'idioma font", () => {
      const mismatches = sourceKeys
        .filter((key) => typeof translation[key] === "string")
        .filter((key) => {
          try {
            return argumentsOf(translation[key]).join() !== argumentsOf(sourceMessages[key]).join();
          } catch {
            // Un text que no es pot interpretar el marca el test de sintaxi
            return false;
          }
        });
      expect(mismatches).toEqual([]);
    });
  });

  it.each([...LANGS_APP])("tots els textos en %s són ICU vàlid", (lang) => {
    const catalog = readJson(fileOf(lang)) as SourceCatalog | TranslationCatalog;
    const invalid = Object.entries(toMessages(catalog)).flatMap(([key, message]) => {
      try {
        parse(message);
        return [];
      } catch (error) {
        return [`${key}: ${(error as Error).message}`];
      }
    });
    expect(invalid).toEqual([]);
  });
});
