import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseSaacFile } from "@features/sequence/style/saacFile";
import type { DocumentSAAC, SequenceStyle } from "@/types/document";
import type { Border, Font, PictSequence } from "@/types/sequence";
import {
  diffStyle,
  mergeDeep,
  resolveCardStyle,
  resolveStyle,
} from "./cascade";
import { sameColor } from "./fitzgerald";
import { ParseContext, ParsedSaac, parseSaac } from "./parse";
import {
  SerializeContext,
  buildStyleFileV3,
  documentToV3,
  serializeSaac,
} from "./serialize";
import { documentFromV3 } from "./toRedux";
import { saacBlob, saacFileName } from "./download";
import type { ResolvedCardStyle, V3Style } from "./types";

// Proves del model v3: migració, anada i tornada, cascada i detecció del
// format. Les fixtures de `test/fixtures/saac/` no es toquen mai (vegeu-ne el
// README); les 11–14 són les del format v3.

const FIXTURES = path.resolve(__dirname, "../../../../test/fixtures/saac");
const readText = (name: string): string =>
  fs.readFileSync(path.join(FIXTURES, name), "utf8");

/** Estil per defecte d'un usuari qualsevol, diferent del de totes les fixtures. */
const USER_DEFAULT: SequenceStyle = {
  pictSequence: {
    numbered: false,
    textPosition: "bottom",
    font: { family: "Lato", color: "#111111", size: 1.1 },
    numberFont: { family: "Lato", color: "#111111", size: 1.1 },
    borderIn: { color: "fitzgerald", radius: 10, size: 3 },
    borderOut: { color: "#123456", radius: 5, size: 1 },
  },
  pictApiAra: {
    skin: "black",
    hair: "red",
    fitzgerald: "#666666",
    color: true,
  },
  view: {
    sizePict: 1.3,
    pictSpaceBetween: 2.5,
    alignmentH: "right",
    alignmentV: "bottom",
    sequenceSpaceBetween: 4,
  },
};

const USER_PAGE = {
  size: "A3",
  orientation: "portrait",
  direction: "column",
} as const;

const NOW = "2026-09-29T10:00:00.000Z";

let counter = 0;
const context: ParseContext = {
  userDefault: USER_DEFAULT,
  userPage: USER_PAGE,
  newDocumentId: () => "doc-nou",
  now: NOW,
};
const serializeContext: SerializeContext = {
  userDefault: USER_DEFAULT,
  userPage: USER_PAGE,
  newId: (prefix) => `${prefix}_${(counter += 1)}`,
  now: NOW,
};

const parseDocument = (name: string) => {
  const parsed = parseSaac(readText(name), context);
  if (parsed.kind !== "document")
    throw new Error(`${name}: esperava un document, ha sortit ${parsed.kind}`);
  return parsed;
};

// --- Com es pintava una targeta abans del v3 ---

/**
 * L'estil que pintava `PictogramCard` fins ara, a partir del document que en
 * treia el lector d'abans. És la referència de la invariant de la migració.
 */
const legacyCardStyle = (
  pict: PictSequence,
  document: DocumentSAAC,
  key: number,
) => {
  const style = document.defaultSettings!;
  const card = style.pictSequence;
  return {
    skin: pict.img.settings.skin,
    hair: pict.img.settings.hair,
    color: pict.img.settings.color,
    fitzgerald: pict.img.settings.fitzgerald,
    numbered: card.numbered,
    // Sense posició no es pintava el text, que és el que fa «none»
    textPosition: pict.settings.textPosition ?? "none",
    font: pict.settings.font ?? card.font,
    numberFont: pict.settings.numberFont ?? card.numberFont ?? card.font,
    borderIn: pict.settings.borderIn ?? card.borderIn,
    borderOut: pict.settings.borderOut ?? card.borderOut,
    view: document.viewSettings[key],
  };
};

const sortedPicts = (sequence: PictSequence[]) =>
  [...sequence].sort((a, b) => a.indexSequence - b.indexSequence);

const LEGACY_FIXTURES = [
  "01-una-pestanya.saac",
  "02-diverses-pestanyes.saac",
  "03-fonts-personalitzades.saac",
  "04-molts-pictogrames.saac",
  "06-format-antic-sense-viewsettings.saac",
  "07-format-primitiu-sequence.saac",
  "08-esquema-2-sequencia.saac",
  "10-estil-parcial.saac",
  "11-una-pestanya.saac.txt",
  "12-imatge-repetida.saac",
];

describe("migració dels formats antics", () => {
  it.each(LEGACY_FIXTURES)(
    "%s: cada targeta es veu igual abans i després",
    (name) => {
      const legacy = parseSaacFile(JSON.parse(readText(name)), {
        userDefault: USER_DEFAULT,
        newId: () => "doc-nou",
      });
      if (legacy.kind !== "document") throw new Error("no és un document");
      const { file } = parseDocument(name);

      const keys = Object.keys(legacy.document.content)
        .map(Number)
        .sort((a, b) => a - b)
        .filter((key) => legacy.document.content[key].length > 0);
      expect(file.sequences).toHaveLength(keys.length);

      keys.forEach((key, s) => {
        const sequence = file.sequences[s];
        const before = sortedPicts(legacy.document.content[key]);
        expect(sequence.pictograms).toHaveLength(before.length);

        before.forEach((pict, p) => {
          const old = legacyCardStyle(pict, legacy.document, key);
          const now = resolveStyle(
            file,
            sequence.id,
            sequence.pictograms[p].id,
          ) as ResolvedCardStyle;

          expect(now.card.numbered).toBe(old.numbered);
          expect(now.card.textPosition).toBe(old.textPosition);
          expect(now.card.font).toEqual(old.font);
          expect(now.card.numberFont).toEqual(old.numberFont);
          expect(now.card.borderIn).toEqual(old.borderIn);
          expect(now.card.borderOut).toEqual(old.borderOut);
          expect(now.view).toEqual(old.view);
          // El Fitzgerald: el mateix color (la forma curta i les majúscules
          // no compten)
          expect(sameColor(now.pictogram.fitzgerald, old.fitzgerald!)).toBe(
            true,
          );
          // Pell, cabell i color: els del pictograma, quan en portava
          if (old.skin !== undefined) expect(now.pictogram.skin).toBe(old.skin);
          if (old.hair !== undefined) expect(now.pictogram.hair).toBe(old.hair);
          if (old.color !== undefined)
            expect(now.pictogram.color).toBe(old.color);
        });
      });
    },
  );

  it("les seqüències buides desapareixen, i l'ordre es conserva", () => {
    const { file, document } = parseDocument("02-diverses-pestanyes.saac");
    // 02: quatre pestanyes (3, 5, 4 i 0 pictogrames)
    expect(file.sequences.map((s) => s.pictograms.length)).toEqual([3, 5, 4]);
    expect(Object.keys(document.content)).toEqual(["0", "1", "2"]);
    // La pestanya activa (la 2) continua sent la mateixa
    expect(file.ui?.activeSequence).toBe(file.sequences[2].id);
    expect(document.activeSAAC).toBe(2);
  });

  it("els pictogrames s'ordenen per `indexSequence`", () => {
    const raw = JSON.parse(readText("01-una-pestanya.saac"));
    raw.documentState.content["0"].reverse();
    const parsed = parseSaac(JSON.stringify(raw), context);
    if (parsed.kind !== "document") throw new Error();
    const words = parsed.file.sequences[0].pictograms.map((p) => p.word);
    const original = parseDocument("01-una-pestanya.saac").file.sequences[0]
      .pictograms;
    expect(words).toEqual(original.map((p) => p.word));
  });

  it("les imatges pròpies repetides es guarden un sol cop", () => {
    const { file } = parseDocument("12-imatge-repetida.saac");
    const assets = Object.values(file.assets ?? {});
    // Una data URL tres cops i una URL del núvol dues vegades
    expect(assets).toHaveLength(2);
    expect(assets.filter((a) => a.data)).toHaveLength(1);
    expect(assets.filter((a) => a.url)).toHaveLength(1);
    const refs = file.sequences
      .flatMap((s) => s.pictograms)
      .map((p) => (p.image.source === "own" ? p.image.asset : null))
      .filter(Boolean);
    expect(refs).toHaveLength(5);
    expect(new Set(refs).size).toBe(2);
    // El fitxer desat també
    expect(serializeSaac(file).split("base64,").length - 1).toBe(1);
  });

  it("la categoria es dedueix del color, i la resta de colors queden com a retoc", () => {
    const { file } = parseDocument("04-molts-pictogrames.saac");
    const picts = file.sequences.flatMap((s) => s.pictograms);
    expect(
      picts.every((p) => p.style?.pictogram?.fitzgerald === undefined),
    ).toBe(true);
    expect(new Set(picts.map((p) => p.category))).toEqual(
      new Set(["verb", "noun", "descriptive", "socialContent"]),
    );
  });

  it("un color que no és de cap categoria es conserva com a retoc", () => {
    const raw = JSON.parse(readText("07-format-primitiu-sequence.saac"));
    raw.sequence[0].img.settings.fitzgerald = "#FFCD94";
    const parsed = parseSaac(JSON.stringify(raw), context);
    if (parsed.kind !== "document") throw new Error();
    const pict = parsed.file.sequences[0].pictograms[0];
    expect(pict.category).toBeUndefined();
    expect(pict.style?.pictogram?.fitzgerald).toBe("#FFCD94");
  });

  it("un pictograma sense cap Fitzgerald pren el color `none` (C11)", () => {
    const raw = JSON.parse(readText("07-format-primitiu-sequence.saac"));
    delete raw.sequence[0].img.settings.fitzgerald;
    const parsed = parseSaac(JSON.stringify(raw), context);
    if (parsed.kind !== "document") throw new Error();
    const { sequences } = parsed.file;
    const resolved = resolveStyle(
      parsed.file,
      sequences[0].id,
      sequences[0].pictograms[0].id,
    );
    expect(resolved?.pictogram.fitzgerald).toBe("#666666");
  });

  it("la pàgina dels documents antics és la de qui obre", () => {
    const { file, document } = parseDocument("01-una-pestanya.saac");
    expect(file.page).toEqual({
      size: "A3",
      orientation: "portrait",
      direction: "column",
      sequenceGap: 4,
      layout: "flow",
    });
    expect(document.layout).toEqual({
      pageSize: "A3",
      orientation: "portrait",
      direction: "column",
    });
  });

  it("`settings.fontSize` s'ignora: la mida ve de l'estil", () => {
    const { file } = parseDocument("10-estil-parcial.saac");
    // 10 porta fontSize: 1 a cada pictograma i una lletra de 1,3 a l'estil
    const resolved = resolveStyle(
      file,
      file.sequences[0].id,
      file.sequences[0].pictograms[0].id,
    );
    expect(resolved?.card.font.size).toBe(1.3);
    expect(serializeSaac(file)).not.toContain("fontSize");
  });

  it("avisa que és antic, i si no portava estil", () => {
    expect(parseDocument("01-una-pestanya.saac").notices).toEqual({
      legacy: true,
      withoutStyle: true,
      newerVersion: false,
    });
    expect(parseDocument("02-diverses-pestanyes.saac").notices).toEqual({
      legacy: true,
      withoutStyle: false,
      newerVersion: false,
    });
  });
});

describe("detecció del format", () => {
  it("un `.saac.txt` s'obre igual que un `.saac`", () => {
    const txt = parseDocument("11-una-pestanya.saac.txt");
    const saac = parseDocument("01-una-pestanya.saac");
    expect(txt.document.content).toEqual(saac.document.content);
  });

  it("un fitxer malmès no s'obre", () => {
    expect(parseSaac(readText("13-malmes.saac"), context)).toEqual({
      kind: "invalid",
    });
    expect(parseSaac("{}", context).kind).toBe("invalid");
    expect(parseSaac("[1,2]", context).kind).toBe("invalid");
    expect(
      parseSaac(
        '{"format":"sequenciaac","kind":"document","schemaVersion":3}',
        context,
      ).kind,
    ).toBe("invalid");
  });

  it("una versió més nova s'obre, avisa i conserva el que no coneix", () => {
    const parsed = parseDocument("14-versio-99.saac");
    expect(parsed.notices.newerVersion).toBe(true);
    const again = documentToV3(parsed.document, serializeContext);
    const raw = JSON.parse(readText("14-versio-99.saac"));
    expect(again.camp_del_futur).toEqual(raw.camp_del_futur);
    expect((again.page as unknown as Record<string, unknown>).marges_nous).toBe(
      3,
    );
    expect((again.style as unknown as Record<string, unknown>).ombres).toBe(
      true,
    );
    expect(again.sequences[0].title).toBe("Matí");
    expect(again.sequences[0].pictograms[0].animacio).toBe("bota");
    expect(again.meta.createdAt).toBe("2031-01-01T00:00:00.000Z");
    // Es desa amb la versió que coneix l'app
    expect(again.schemaVersion).toBe(3);
  });

  it("el tipus es decideix pel contingut: un estil és un estil", () => {
    const style = parseSaac(readText("09-esquema-2-estil.saacstyle"), context);
    expect(style.kind).toBe("style");
    const onlySettings = parseSaac(
      readText("05-nomes-configuracio.saac"),
      context,
    );
    expect(onlySettings.kind).toBe("style");

    const v3Style = serializeSaac(buildStyleFileV3(USER_DEFAULT, "El meu"));
    const parsed = parseSaac(v3Style, context) as Extract<
      ParsedSaac,
      { kind: "style" }
    >;
    expect(parsed.kind).toBe("style");
    expect(parsed.title).toBe("El meu");
    expect(parsed.style.pictSequence).toEqual(USER_DEFAULT.pictSequence);
    expect(parsed.style.pictApiAra).toEqual(USER_DEFAULT.pictApiAra);
  });

  it("un fitxer d'estil no porta pàgina ni res més", () => {
    const file = buildStyleFileV3(USER_DEFAULT);
    expect(Object.keys(file).sort()).toEqual(
      ["format", "kind", "schemaVersion", "style"].sort(),
    );
  });
});

describe("anada i tornada", () => {
  it.each(LEGACY_FIXTURES)("%s: parse(serialize(doc)) és el mateix", (name) => {
    const { file } = parseDocument(name);
    const text = serializeSaac(file);
    const again = parseSaac(text, context);
    if (again.kind !== "document") throw new Error();
    expect(JSON.parse(serializeSaac(again.file))).toEqual(JSON.parse(text));
  });

  it.each(LEGACY_FIXTURES)(
    "%s: Redux → v3 → Redux → v3 dona el mateix fitxer",
    (name) => {
      const { file, document } = parseDocument(name);
      const again = documentToV3(document, serializeContext);
      expect(again).toEqual({
        ...file,
        meta: { ...file.meta, updatedAt: NOW },
      });
      expect(documentFromV3(again)).toEqual(document);
    },
  );

  it("els identificadors del fitxer es conserven, i els repetits se'n generen de nous", () => {
    const { document, file } = parseDocument("01-una-pestanya.saac");
    const [first, second, ...rest] = document.content[0];
    const pasted: DocumentSAAC = {
      ...document,
      sequenceIds: undefined,
      content: { 0: [first, { ...second, id: first.id }, ...rest] },
    };
    const again = documentToV3(pasted, serializeContext);
    const ids = again.sequences[0].pictograms.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe(file.sequences[0].pictograms[0].id);
    // Sense identificador, la seqüència en rep un que depèn de la posició
    expect(again.sequences[0].id).toBe("seq_1");
    expect(documentToV3(pasted, serializeContext).sequences[0].id).toBe(
      "seq_1",
    );
  });
});

describe("cascada", () => {
  const style: V3Style = {
    pictogram: {
      skin: "white",
      hair: "brown",
      color: true,
      fitzgerald: {
        properNoun: "#FFEB3B",
        noun: "#FF9800",
        verb: "#4CAF50",
        descriptive: "#2196F3",
        socialContent: "#9C27B0",
        miscellaneous: "#FFFFFF",
        none: "#666666",
      },
    },
    card: {
      numbered: true,
      textPosition: "top",
      font: { family: "Roboto", color: "#000000", size: 1 },
      numberFont: { family: "Roboto", color: "#000000", size: 1 },
      borderIn: { color: "fitzgerald", radius: 20, size: 2 },
      borderOut: { color: "#1565c0", radius: 8, size: 4 },
    },
    view: {
      sizePict: 1,
      pictSpaceBetween: 1,
      alignmentH: "center",
      alignmentV: "top",
    },
  };

  it("combina propietat a propietat: guanya el nivell més proper", () => {
    const resolved = resolveCardStyle(
      style,
      { sizePict: 1.5 },
      { style: { card: { font: { color: "#b71c1c" } } } },
    );
    expect(resolved.card.font).toEqual({
      family: "Roboto",
      color: "#b71c1c",
      size: 1,
    } satisfies Font);
    expect(resolved.view.sizePict).toBe(1.5);
    expect(resolved.view.alignmentH).toBe("center");
  });

  it("la mida de la lletra és `font.size` del pictograma si en porta", () => {
    const resolved = resolveCardStyle(style, undefined, {
      style: { card: { font: { size: 2 } } },
    });
    expect(resolved.card.font.size).toBe(2);
  });

  it("el Fitzgerald: retoc, categoria o `none`", () => {
    expect(
      resolveCardStyle(style, undefined, { category: "verb" }).pictogram
        .fitzgerald,
    ).toBe("#4CAF50");
    expect(resolveCardStyle(style, undefined, {}).pictogram.fitzgerald).toBe(
      "#666666",
    );
    expect(
      resolveCardStyle(style, undefined, {
        category: "verb",
        style: { pictogram: { fitzgerald: "#000000" } },
      }).pictogram.fitzgerald,
    ).toBe("#000000");
  });

  it("`diffStyle` guarda només les diferències", () => {
    const full = mergeDeep(style.card, {
      borderOut: { color: "#999999" } as Partial<Border>,
    });
    expect(diffStyle(style.card, full)).toEqual({
      borderOut: { color: "#999999" },
    });
    expect(diffStyle(style.card, style.card)).toBeUndefined();
  });
});

describe("aïllament", () => {
  it("obrir un document no toca l'estil ni la pàgina de l'usuari", () => {
    const before = JSON.stringify({ USER_DEFAULT, USER_PAGE });
    LEGACY_FIXTURES.forEach((name) => parseDocument(name));
    parseDocument("14-versio-99.saac");
    expect(JSON.stringify({ USER_DEFAULT, USER_PAGE })).toBe(before);
  });
});

describe("descàrrega", () => {
  it("el Blob és `application/octet-stream`", () => {
    expect(saacBlob("{}").type).toBe("application/octet-stream");
  });

  it("el nom acaba en `.saac` o `.saacstyle`, sense repetir-la", () => {
    const date = new Date("2026-09-29T10:00:00.000Z");
    expect(saacFileName("Rutina", ".saac", date)).toBe("Rutina.saac");
    expect(saacFileName("Rutina.saac", ".saac", date)).toBe("Rutina.saac");
    expect(saacFileName("Rutina.saac.txt", ".saac", date)).toBe("Rutina.saac");
    expect(saacFileName("Blau", ".saacstyle", date)).toBe("Blau.saacstyle");
    expect(saacFileName("", ".saac", date)).toBe(
      "SequenciAAC_2026-09-29T10:00:00.saac",
    );
  });
});
