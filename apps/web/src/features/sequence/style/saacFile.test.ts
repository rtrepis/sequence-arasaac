import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  buildDocumentFile,
  buildStyleFile,
  mergeStyle,
  normalizeDocumentState,
  parseSaacFile,
  SAAC_SCHEMA_VERSION,
} from "./saacFile";
import { resolveDocumentStyle } from "./styleModel";
import { DocumentSAAC, SequenceStyle } from "@/types/document";
import { DefaultSettings } from "@/types/ui";

// Proves de càrrega, fusió i migració del format. Les fixtures de
// `test/fixtures/saac/` són el format d'abans i no es toquen mai (vegeu-ne el
// README): aquí es comprova que totes s'obren i com.

const FIXTURES = path.resolve(__dirname, "../../../../test/fixtures/saac");
const readFixture = (name: string): unknown =>
  JSON.parse(fs.readFileSync(path.join(FIXTURES, name), "utf8"));

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

const options = { userDefault: USER_DEFAULT, newId: () => "id-nou" };

const parseDocument = (raw: unknown) => {
  const parsed = parseSaacFile(raw, options);
  if (parsed.kind !== "document")
    throw new Error(`esperava un document, ha sortit ${parsed.kind}`);
  return parsed;
};

describe("fitxers antics", () => {
  it("cap fixture deixa d'obrir-se", () => {
    const names = fs
      .readdirSync(FIXTURES)
      .filter((n) => n.endsWith(".saac") || n.endsWith(".saacstyle"));
    expect(names.length).toBeGreaterThanOrEqual(10);
    names.forEach((name) => {
      expect(parseSaacFile(readFixture(name), options).kind).not.toBe(
        "invalid",
      );
    });
  });

  it("2.1.0 sense configuració: estil per defecte, vista de cada pestanya del fitxer", () => {
    const { document, styleOrigin } = parseDocument(
      readFixture("04-molts-pictogrames.saac"),
    );

    expect(styleOrigin).toBe("default");
    expect(document.defaultSettings).toEqual({
      pictSequence: USER_DEFAULT.pictSequence,
      pictApiAra: USER_DEFAULT.pictApiAra,
    });
    // B25: la vista de cada pestanya és la del fitxer, no la de l'usuari
    expect(document.viewSettings[0]).toEqual({
      sizePict: 0.4,
      pictSpaceBetween: 0,
      alignmentH: "left",
      alignmentV: "top",
    });
    expect(document.viewSettings[2].sizePict).toBe(3.8);
    // La base de l'estil és la primera pestanya; l'espai entre seqüències, el per defecte
    expect(document.styleView).toEqual({
      sizePict: 0.4,
      pictSpaceBetween: 0,
      alignmentH: "left",
      alignmentV: "top",
      sequenceSpaceBetween: USER_DEFAULT.view.sequenceSpaceBetween,
    });
  });

  it("2.1.0 amb configuració: l'estil és el que el fitxer portava al costat", () => {
    const raw = readFixture("02-diverses-pestanyes.saac") as {
      defaultSettings: DefaultSettings;
    };
    const { document, styleOrigin } = parseDocument(raw);

    expect(styleOrigin).toBe("file");
    expect(document.defaultSettings).toEqual(raw.defaultSettings);
    expect(document.viewSettings[0]).toEqual({
      sizePict: 1.5,
      pictSpaceBetween: 2,
      alignmentH: "center",
      alignmentV: "top",
    });
    expect(document.viewSettings[2]).toEqual({
      sizePict: 0.7,
      pictSpaceBetween: 0.5,
      alignmentH: "right",
      alignmentV: "bottom",
    });
    // Les dades del document es conserven
    expect(document.title).toBeDefined();
    expect(document.order).toBeDefined();
    expect(document.activeSAAC).toBe(2);
  });

  it("antic sense viewSettings: vista de l'estil per defecte a totes les pestanyes", () => {
    const { document, styleOrigin } = parseDocument(
      readFixture("06-format-antic-sense-viewsettings.saac"),
    );

    expect(styleOrigin).toBe("default");
    const tabView = {
      sizePict: 1.3,
      pictSpaceBetween: 2.5,
      alignmentH: "right",
      alignmentV: "bottom",
    };
    expect(document.viewSettings).toEqual({ 0: tabView, 1: tabView });
    expect(document.styleView).toEqual(USER_DEFAULT.view);
    // `order: null` i `defaultSettings: null` no fan caure res
    expect(document.order).toBeUndefined();
    expect(document.defaultSettings?.pictSequence.font.family).toBe("Lato");
  });

  it("primitiu: la seqüència és la primera d'un document nou", () => {
    const raw = readFixture("07-format-primitiu-sequence.saac") as {
      sequence: unknown[];
    };
    const { document, styleOrigin } = parseDocument(raw);

    expect(styleOrigin).toBe("default");
    expect(document.id).toBe("id-nou");
    expect(document.content[0]).toEqual(raw.sequence);
    expect(document.activeSAAC).toBe(0);
  });

  it("«només preferències» s'interpreta com a fitxer d'estil", () => {
    const raw = readFixture("05-nomes-configuracio.saac") as {
      defaultSettings: DefaultSettings;
    };
    const parsed = parseSaacFile(raw, options);

    expect(parsed.kind).toBe("style");
    if (parsed.kind !== "style") return;
    expect(parsed.style.pictSequence).toEqual(raw.defaultSettings.pictSequence);
    expect(parsed.style.pictApiAra).toEqual(raw.defaultSettings.pictApiAra);
    // No portava vista: la del per defecte
    expect(parsed.style.view).toEqual(USER_DEFAULT.view);
  });

  it("alineació única d'abans i fitzgerald en objecte, com els normalitza l'API", () => {
    const { document } = parseDocument({
      documentState: {
        id: "x",
        content: {
          0: [
            {
              indexSequence: 0,
              img: {
                searched: { word: "a", bestIdPicts: [1] },
                selectedId: 1,
                settings: { fitzgerald: { value: "noun", color: "#ff0000" } },
              },
              cross: false,
              settings: {},
            },
          ],
        },
        viewSettings: {
          0: { sizePict: 2, pictSpaceBetween: 1, alignment: "center" },
        },
        activeSAAC: 0,
      },
    });

    expect(document.viewSettings[0].alignmentH).toBe("center");
    expect(document.viewSettings[0].alignmentV).toBe("bottom"); // de l'estil per defecte
    expect(document.content[0][0].img.settings.fitzgerald).toBe("#ff0000");
  });

  it("un fitxer que no és de l'app es rebutja", () => {
    expect(parseSaacFile(null, options).kind).toBe("invalid");
    expect(parseSaacFile([1, 2], options).kind).toBe("invalid");
    expect(parseSaacFile({ hola: 1 }, options).kind).toBe("invalid");
    expect(parseSaacFile({ documentState: { content: 3 } }, options).kind).toBe(
      "invalid",
    );
  });
});

describe("estil parcial: fusió camp a camp", () => {
  it("la fixture 10: configuració d'abans de `numberFont`", () => {
    const raw = readFixture("10-estil-parcial.saac") as {
      defaultSettings: { pictSequence: { font: unknown } };
    };
    const { document, styleOrigin } = parseDocument(raw);

    expect(styleOrigin).toBe("partial");
    const ps = document.defaultSettings!.pictSequence;
    expect(ps.font).toEqual(raw.defaultSettings.pictSequence.font);
    expect(ps.numberFont).toEqual(raw.defaultSettings.pictSequence.font);
    expect(document.defaultSettings!.pictApiAra.skin).toBe("asian");
  });

  it("les fixtures de l'esquema 2 s'obren com es van desar", () => {
    const sequence = readFixture("08-esquema-2-sequencia.saac") as {
      documentState: DocumentSAAC;
    };
    const parsed = parseDocument(sequence);
    expect(parsed.styleOrigin).toBe("file");
    expect(
      buildDocumentFile(
        parsed.document,
        resolveDocumentStyle(parsed.document, USER_DEFAULT),
      ),
    ).toEqual(sequence);

    const style = readFixture("09-esquema-2-estil.saacstyle") as {
      style: SequenceStyle;
    };
    expect(parseSaacFile(style, options)).toEqual({
      kind: "style",
      style: style.style,
    });
  });

  it("fa servir les propietats del fitxer i omple les que falten", () => {
    const { document, styleOrigin } = parseDocument({
      defaultSettings: {
        pictSequence: {
          numbered: true,
          font: { family: "Escolar", color: "#ff0000" }, // sense `size`
          borderOut: { color: "#000000", radius: 0, size: 4 },
        },
        // sense pictApiAra
      },
      documentState: {
        id: "p",
        content: { 0: [] },
        viewSettings: {},
        activeSAAC: 0,
      },
    });

    expect(styleOrigin).toBe("partial");
    const ps = document.defaultSettings!.pictSequence;
    expect(ps.numbered).toBe(true);
    expect(ps.font).toEqual({ family: "Escolar", color: "#ff0000", size: 1.1 });
    expect(ps.borderOut).toEqual({ color: "#000000", radius: 0, size: 4 });
    expect(ps.textPosition).toBe("bottom");
    expect(ps.borderIn).toEqual(USER_DEFAULT.pictSequence.borderIn);
    expect(document.defaultSettings!.pictApiAra).toEqual(
      USER_DEFAULT.pictApiAra,
    );
  });

  it("sense lletra per als números, els números fan servir la del text del fitxer", () => {
    const { style } = mergeStyle(
      {
        pictSequence: { font: { family: "Memima", color: "#222222", size: 2 } },
      },
      USER_DEFAULT,
    );
    expect(style.pictSequence.numberFont).toEqual({
      family: "Memima",
      color: "#222222",
      size: 2,
    });
  });

  it("un valor amb el tipus o l'opció equivocats compta com a absent", () => {
    const { style, complete } = mergeStyle(
      {
        pictSequence: { textPosition: "left", numbered: "sí" },
        pictApiAra: { skin: "blue", hair: "red", color: false },
        view: { sizePict: "gran", alignmentH: "center" },
      },
      USER_DEFAULT,
    );
    expect(complete).toBe(false);
    expect(style.pictSequence.textPosition).toBe("bottom");
    expect(style.pictSequence.numbered).toBe(false);
    expect(style.pictApiAra).toMatchObject({
      skin: "black",
      hair: "red",
      color: false,
    });
    expect(style.view.sizePict).toBe(1.3);
    expect(style.view.alignmentH).toBe("center");
  });
});

describe("esquema 2", () => {
  const document: DocumentSAAC = {
    id: "doc",
    title: "Rutina",
    content: { 0: [], 1: [] },
    // La pestanya 1 és nova: no té vista pròpia i segueix la de l'estil
    viewSettings: {
      0: {
        sizePict: 2,
        pictSpaceBetween: 1,
        alignmentH: "center",
        alignmentV: "top",
      },
    },
    activeSAAC: 0,
  };

  it("«Desa el document» porta sempre l'estil, i totes les seqüències amb vista", () => {
    const file = buildDocumentFile(document, USER_DEFAULT);

    expect(file.schemaVersion).toBe(SAAC_SCHEMA_VERSION);
    expect(file.documentState.defaultSettings).toEqual({
      pictSequence: USER_DEFAULT.pictSequence,
      pictApiAra: USER_DEFAULT.pictApiAra,
    });
    expect(file.documentState.styleView).toEqual(USER_DEFAULT.view);
    expect(file.documentState.viewSettings[1]).toEqual({
      sizePict: 1.3,
      pictSpaceBetween: 2.5,
      alignmentH: "right",
      alignmentV: "bottom",
    });
  });

  it("un document desat s'obre tal com es va desar, amb un altre estil per defecte", () => {
    const saved = JSON.parse(
      JSON.stringify(buildDocumentFile(document, USER_DEFAULT)),
    );
    const otherUser: SequenceStyle = {
      ...USER_DEFAULT,
      pictSequence: {
        ...USER_DEFAULT.pictSequence,
        font: { family: "Inter", color: "#000000", size: 1 },
      },
      view: { ...USER_DEFAULT.view, sizePict: 0.5 },
    };

    const parsed = parseSaacFile(saved, {
      userDefault: otherUser,
      newId: () => "?",
    });
    expect(parsed.kind).toBe("document");
    if (parsed.kind !== "document") return;

    expect(parsed.styleOrigin).toBe("file");
    expect(resolveDocumentStyle(parsed.document, otherUser)).toEqual(
      USER_DEFAULT,
    );
    expect(parsed.document.viewSettings[0].sizePict).toBe(2);
    expect(parsed.document.viewSettings[1].sizePict).toBe(1.3);
  });

  it("anada i tornada: tornar a desar dona el mateix fitxer", () => {
    const first = buildDocumentFile(document, USER_DEFAULT);
    const parsed = parseDocument(JSON.parse(JSON.stringify(first)));
    const second = buildDocumentFile(
      parsed.document,
      resolveDocumentStyle(parsed.document, USER_DEFAULT),
    );
    expect(second).toEqual(first);
  });

  it("«Desar estil» porta només l'aparença, i es llegeix com a estil", () => {
    const file = JSON.parse(JSON.stringify(buildStyleFile(USER_DEFAULT)));
    expect(Object.keys(file).sort()).toEqual(["schemaVersion", "style"]);

    const parsed = parseSaacFile(file, options);
    expect(parsed).toEqual({ kind: "style", style: USER_DEFAULT });
  });

  it("la disposició (B26) s'admet i es conserva, encara que ningú no l'escrigui", () => {
    const layout = {
      direction: "column",
      pageSize: "A3",
      orientation: "portrait",
    };
    const result = normalizeDocumentState(
      { ...document, layout },
      { userDefault: USER_DEFAULT },
    );
    expect(result?.document.layout).toEqual(layout);
  });
});
