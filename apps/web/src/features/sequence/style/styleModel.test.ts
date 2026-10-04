import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";
import { describe, expect, it } from "vitest";
import {
  applyStyleToDocument,
  buildUserDefaultStyle,
  fontFamiliesUsed,
  fontStack,
  materializeDocumentStyle,
  resolveDocumentStyle,
  resolveSequenceViews,
} from "./styleModel";
import { DocumentSAAC, SequenceStyle } from "@/types/document";
import { Font, PictSequence } from "@/types/sequence";
import { ViewSettings } from "@/types/ui";

const OLD: SequenceStyle = {
  pictSequence: {
    numbered: false,
    textPosition: "bottom",
    font: { family: "Roboto", color: "#000000", size: 1 },
    numberFont: { family: "Roboto", color: "#000000", size: 1 },
    borderIn: { color: "fitzgerald", radius: 20, size: 2 },
    borderOut: { color: "#999999", radius: 20, size: 2 },
  },
  pictApiAra: {
    skin: "white",
    hair: "brown",
    fitzgerald: "#666666",
    color: true,
  },
  view: {
    sizePict: 1,
    pictSpaceBetween: 1,
    alignmentH: "left",
    alignmentV: "top",
    sequenceSpaceBetween: 1,
  },
};

const NEW: SequenceStyle = {
  pictSequence: {
    numbered: true,
    textPosition: "top",
    font: { family: "Escolar", color: "#1a237e", size: 1.4 },
    numberFont: { family: "Escolar", color: "#1a237e", size: 1 },
    borderIn: { color: "#00ff00", radius: 0, size: 4 },
    borderOut: { color: "#000000", radius: 10, size: 1 },
  },
  pictApiAra: {
    skin: "black",
    hair: "red",
    fitzgerald: "#666666",
    color: false,
  },
  view: {
    sizePict: 2,
    pictSpaceBetween: 3,
    alignmentH: "center",
    alignmentV: "center",
    sequenceSpaceBetween: 5,
  },
};

const pict = (
  settings: PictSequence["settings"],
  imgSettings: PictSequence["img"]["settings"] = {},
): PictSequence => ({
  indexSequence: 0,
  img: {
    searched: { word: "casa", bestIdPicts: [1] },
    selectedId: 1,
    settings: { fitzgerald: "#ff0000", ...imgSettings },
  },
  cross: false,
  settings,
});

const docWith = (
  content: PictSequence[],
  extra: Partial<DocumentSAAC> = {},
): DocumentSAAC => ({
  id: "d",
  content: { 0: content },
  viewSettings: {},
  activeSAAC: 0,
  defaultSettings: {
    pictSequence: OLD.pictSequence,
    pictApiAra: OLD.pictApiAra,
  },
  styleView: OLD.view,
  ...extra,
});

describe("canviar l'estil d'un document", () => {
  it("el que coincidia amb l'estil vell segueix el nou", () => {
    const doc = docWith([
      pict(
        {
          textPosition: "bottom",
          borderIn: { ...OLD.pictSequence.borderIn },
          font: { ...OLD.pictSequence.font },
        },
        { skin: "white", hair: "brown", color: true },
      ),
    ]);
    applyStyleToDocument(doc, OLD, NEW);

    const p = doc.content[0][0];
    expect(p.settings.textPosition).toBe("top");
    expect(p.settings.borderIn).toEqual(NEW.pictSequence.borderIn);
    expect(p.settings.font).toEqual(NEW.pictSequence.font);
    expect(p.img.settings).toMatchObject({
      skin: "black",
      hair: "red",
      color: false,
    });
    // El color de la categoria no és una tria d'aparença: no es toca
    expect(p.img.settings.fitzgerald).toBe("#ff0000");
  });

  it("els retocs manuals es conserven", () => {
    const retouchedFont: Font = {
      family: "Caveat",
      color: "#ff00ff",
      size: 1.8,
    };
    const doc = docWith([
      pict(
        {
          textPosition: "none",
          font: retouchedFont,
          borderOut: { color: "#abcdef", radius: 1, size: 1 },
        },
        { skin: "asian" },
      ),
    ]);
    applyStyleToDocument(doc, OLD, NEW);

    const p = doc.content[0][0];
    expect(p.settings.textPosition).toBe("none");
    expect(p.settings.font).toEqual(retouchedFont);
    expect(p.settings.borderOut).toEqual({
      color: "#abcdef",
      radius: 1,
      size: 1,
    });
    expect(p.img.settings.skin).toBe("asian");
  });

  it("cas límit: un retoc igual a l'estil vell es tracta com a no retocat", () => {
    // L'usuari va triar a mà Roboto negre de mida 1 en aquest pictograma, que
    // resulta ser el mateix que l'estil: no es pot distingir d'un heretat
    const doc = docWith([
      pict({ font: { family: "Roboto", color: "#000000", size: 1 } }),
    ]);
    applyStyleToDocument(doc, OLD, NEW);
    expect(doc.content[0][0].settings.font).toEqual(NEW.pictSequence.font);
  });

  it("el que el pictograma no tenia continua heretant", () => {
    const doc = docWith([pict({})]);
    applyStyleToDocument(doc, OLD, NEW);
    expect(doc.content[0][0].settings).toEqual({});
    expect(doc.defaultSettings).toEqual({
      pictSequence: NEW.pictSequence,
      pictApiAra: NEW.pictApiAra,
    });
  });

  it("les pestanyes: la vista igual a la de l'estil vell segueix la nova, la retocada es queda", () => {
    const doc = docWith([], {
      content: { 0: [], 1: [], 2: [] },
      viewSettings: {
        0: {
          sizePict: 1,
          pictSpaceBetween: 1,
          alignmentH: "left",
          alignmentV: "top",
        },
        1: {
          sizePict: 0.6,
          pictSpaceBetween: 1,
          alignmentH: "right",
          alignmentV: "top",
        },
        // la 2 no en té: hereta
      },
    });
    applyStyleToDocument(doc, OLD, NEW);

    expect(doc.viewSettings[0]).toEqual({
      sizePict: 2,
      pictSpaceBetween: 3,
      alignmentH: "center",
      alignmentV: "center",
    });
    expect(doc.viewSettings[1]).toEqual({
      sizePict: 0.6,
      pictSpaceBetween: 3,
      alignmentH: "right",
      alignmentV: "center",
    });
    expect(doc.viewSettings[2]).toBeUndefined();
    // L'espai entre seqüències és de la pàgina: aplicar un estil no el toca
    expect(doc.styleView).toEqual({
      ...NEW.view,
      sequenceSpaceBetween: OLD.view.sequenceSpaceBetween,
    });
    expect(resolveSequenceViews(doc, doc.styleView!)[2].sizePict).toBe(2);
  });

  it("els pictogrames no comparteixen objectes amb l'estil", () => {
    const doc = docWith([
      pict({ font: { ...OLD.pictSequence.font } }),
      pict({ font: { ...OLD.pictSequence.font } }),
    ]);
    applyStyleToDocument(doc, OLD, NEW);
    expect(doc.content[0][0].settings.font).not.toBe(
      doc.content[0][1].settings.font,
    );
    expect(doc.content[0][0].settings.font).not.toBe(NEW.pictSequence.font);
  });

  it("aplicar el mateix estil no canvia res", () => {
    const doc = docWith([
      pict({ font: { family: "Caveat", color: "#000000", size: 1 } }),
    ]);
    const before = JSON.parse(JSON.stringify(doc));
    applyStyleToDocument(doc, OLD, OLD);
    // Només s'hi escriu la taula de Fitzgerald, que abans heretava
    expect(doc).toEqual({
      ...before,
      fitzgeraldColors: DEFAULT_FITZGERALD_CATEGORY_COLORS,
    });
  });
});

describe("estil d'un document nou", () => {
  it("sense estil propi hereta el per defecte, i desar-lo el fa explícit", () => {
    const doc: DocumentSAAC = {
      id: "n",
      content: { 0: [] },
      viewSettings: {},
      activeSAAC: 0,
    };
    expect(resolveDocumentStyle(doc, NEW)).toEqual({
      ...NEW,
      fitzgeraldColors: DEFAULT_FITZGERALD_CATEGORY_COLORS,
    });

    const saved = materializeDocumentStyle(doc, NEW);
    expect(saved.defaultSettings).toEqual({
      pictSequence: NEW.pictSequence,
      pictApiAra: NEW.pictApiAra,
    });
    expect(saved.styleView).toEqual(NEW.view);
    expect(saved.viewSettings[0]).toEqual({
      sizePict: 2,
      pictSpaceBetween: 3,
      alignmentH: "center",
      alignmentV: "center",
    });
  });

  it("l'estil per defecte surt de les preferències, sense la disposició", () => {
    const viewSettings: ViewSettings = {
      sizePict: 1.2,
      pictSpaceBetween: 2,
      sequenceSpaceBetween: 3,
      alignmentH: "center",
      alignmentV: "bottom",
      direction: "column",
      pageSize: "A3",
      orientation: "portrait",
      author: "Anna",
    };
    const style = buildUserDefaultStyle(
      { pictSequence: OLD.pictSequence, pictApiAra: OLD.pictApiAra },
      viewSettings,
    );
    expect(style.view).toEqual({
      sizePict: 1.2,
      pictSpaceBetween: 2,
      sequenceSpaceBetween: 3,
      alignmentH: "center",
      alignmentV: "bottom",
    });
  });
});

describe("fonts", () => {
  it("recull les famílies de l'estil i dels pictogrames retocats", () => {
    const doc = docWith([
      pict({ font: { family: "Caveat", color: "#000", size: 1 } }),
      pict({}),
    ]);
    expect(fontFamiliesUsed(doc, OLD)).toEqual(["Caveat", "Roboto"]);
    expect(fontFamiliesUsed(doc, NEW)).toEqual(["Caveat", "Escolar"]);
  });

  it("la pila de lletra acaba en una sans-serif del sistema", () => {
    expect(fontStack("Noto Sans Arabic")).toBe(
      '"Noto Sans Arabic", sans-serif',
    );
  });
});
