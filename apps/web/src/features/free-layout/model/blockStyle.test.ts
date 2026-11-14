import { describe, expect, it } from "vitest";
import type {
  DocumentPages,
  NamedStyle,
  SequenceViewSettings,
} from "@/types/document";
import type { Font } from "@/types/sequence";
import type { SequenceStyle } from "@/types/document";
import { sequenceFixture } from "@/test/fixtures/document";
import { buildUserDefaultStyle } from "@features/sequence/style/styleModel";
import { createAppStore } from "@/app/store";
import {
  TEXT_BLOCK_DEFAULTS,
  blockSequence,
  blockViewRetouch,
  cardMeasureKey,
  cardSizeOf,
  applyNamedStyle,
  namedStyleFrom,
  namedStyleOf,
  removeNamedStyle,
  resolveBlockView,
  styleUseCount,
  targetStyleIds,
  uniqueStyleName,
  updateNamedStyles,
  resolveTextBlockStyle,
  styleWithNamed,
} from "./blockStyle";

// L'aspecte d'un bloc: document → seqüència → estil amb nom → bloc
// (`blockStyle.ts`).

const SEQUENCE_VIEW: SequenceViewSettings = {
  sizePict: 1,
  pictSpaceBetween: 2,
  alignmentH: "center",
  alignmentV: "top",
};

const AGENDA: NamedStyle = {
  id: "st_1",
  name: "Agenda",
  view: { sizePict: 1.5, alignmentV: "center" },
  pictSequence: { font: { size: 1.3 } },
};

const FONT: Font = { family: "Roboto", color: "#000000", size: 1 };

describe("l'estil amb nom d'un bloc", () => {
  it("es troba pel seu id; sense id o si no hi és, cap", () => {
    expect(namedStyleOf([AGENDA], "st_1")).toBe(AGENDA);
    expect(namedStyleOf([AGENDA], "st_2")).toBeUndefined();
    expect(namedStyleOf([AGENDA], undefined)).toBeUndefined();
    expect(namedStyleOf(undefined, "st_1")).toBeUndefined();
  });
});

describe("la vista d'un bloc de seqüència", () => {
  it("sense estil ni retoc, és la de la seqüència", () => {
    expect(resolveBlockView(SEQUENCE_VIEW, undefined, undefined)).toEqual(
      SEQUENCE_VIEW,
    );
  });

  it("l'estil amb nom retoca la seqüència, i el bloc retoca l'estil", () => {
    expect(
      resolveBlockView(SEQUENCE_VIEW, AGENDA, { alignmentV: "bottom" }),
    ).toEqual({
      sizePict: 1.5,
      pictSpaceBetween: 2,
      alignmentH: "center",
      alignmentV: "bottom",
    });
  });
});

describe("l'aspecte d'un bloc de text", () => {
  it("per defecte, la lletra de les targetes, centrat i sense negreta", () => {
    expect(resolveTextBlockStyle(FONT, undefined, {})).toEqual({
      ...TEXT_BLOCK_DEFAULTS,
      font: FONT,
    });
  });

  it("propietat a propietat: document, estil amb nom i bloc", () => {
    expect(
      resolveTextBlockStyle(FONT, AGENDA, {
        textStyle: { bold: true, font: { color: "#b71c1c" } },
      }),
    ).toEqual({
      bold: true,
      alignmentH: "center",
      alignmentV: "center",
      font: { family: "Roboto", color: "#b71c1c", size: 1.3 },
    });
  });
});

describe("el retoc de la vista d'un bloc", () => {
  it("només porta el que es diferencia de la base", () => {
    expect(
      blockViewRetouch(SEQUENCE_VIEW, {
        ...SEQUENCE_VIEW,
        sizePict: 0.6,
        alignmentV: "bottom",
      }),
    ).toEqual({ sizePict: 0.6, alignmentV: "bottom" });
  });

  it("sense cap diferència, el bloc no porta retoc", () => {
    expect(blockViewRetouch(SEQUENCE_VIEW, { ...SEQUENCE_VIEW })).toBe(
      undefined,
    );
  });
});

describe("les targetes d'un bloc amb estil amb nom (R10)", () => {
  const ui = createAppStore().getState().ui;
  const DOCUMENT: SequenceStyle = buildUserDefaultStyle(
    ui.defaultSettings,
    ui.viewSettings,
  );
  const BIG_TEXT: SequenceStyle = {
    ...DOCUMENT,
    pictSequence: {
      ...DOCUMENT.pictSequence,
      font: { ...DOCUMENT.pictSequence.font, size: 1.6 },
      textPosition: "top",
    },
    pictApiAra: { ...DOCUMENT.pictApiAra, color: !DOCUMENT.pictApiAra.color },
  };
  const named = namedStyleFrom(BIG_TEXT, { id: "st_9", name: "El meu estil" });

  it("porta l'estil dels pictogrames i no la distribució, que és del bloc", () => {
    expect(named).not.toHaveProperty("view");
    expect(styleWithNamed(DOCUMENT, named).pictSequence.font.size).toBe(1.6);
    expect(styleWithNamed(DOCUMENT, undefined)).toBe(DOCUMENT);
  });

  it("el que els pictogrames heretaven segueix l'estil amb nom; els retocs, no", () => {
    const pictograms = sequenceFixture(2).map((pict) => ({
      ...pict,
      settings: {
        ...pict.settings,
        textPosition: DOCUMENT.pictSequence.textPosition,
      },
      img: {
        ...pict.img,
        settings: { ...pict.img.settings, color: DOCUMENT.pictApiAra.color },
      },
    }));
    // El segon té la posició del text retocada
    pictograms[1].settings.textPosition =
      DOCUMENT.pictSequence.textPosition === "bottom" ? "top" : "bottom";
    const retouched = pictograms[1].settings.textPosition;

    const result = blockSequence(pictograms, DOCUMENT, named);

    expect(result[0].settings.textPosition).toBe("top");
    expect(result[0].img.settings.color).toBe(BIG_TEXT.pictApiAra.color);
    expect(result[1].settings.textPosition).toBe(retouched);
    // No toca la seqüència del document
    expect(pictograms[0].settings.textPosition).toBe(
      DOCUMENT.pictSequence.textPosition,
    );
    expect(blockSequence(pictograms, DOCUMENT, undefined)).toBe(pictograms);
  });

  it("es mesura per seqüència i estil, i si no hi és, la de la seqüència", () => {
    expect(cardMeasureKey(2, undefined)).toBe("2");
    expect(cardMeasureKey(2, "st_9")).toBe("2@st_9");
    const sizes = { "2": { w: 1, h: 1 }, "2@st_9": { w: 2, h: 2 } };
    expect(cardSizeOf(sizes, 2, "st_9")).toEqual({ w: 2, h: 2 });
    expect(cardSizeOf(sizes, 2, "st_x")).toEqual({ w: 1, h: 1 });
  });
});

describe("els estils de bloc (R7)", () => {
  const card = (size: number): NamedStyle["pictSequence"] =>
    ({ font: { size } }) as NamedStyle["pictSequence"];
  const style = (id: string, name: string, size: number): NamedStyle => ({
    id,
    name,
    pictSequence: card(size),
  });
  const block = (id: string, styleId?: string) => ({
    kind: "sequence" as const,
    id,
    sequenceKey: 0,
    x: 0,
    y: 0,
    w: 10,
    h: 10,
    columns: "auto" as const,
    ...(styleId && { styleId }),
    view: { sizePict: 0.5 },
  });
  const pages = (): DocumentPages => ({
    sheets: [
      {
        id: "s1",
        mode: "template",
        placements: [block("a", "st_1"), block("b")],
      },
      { id: "s2", mode: "template", placements: [block("c", "st_1")] },
    ],
    common: [block("d", "st_2")],
  });
  const styles = [style("st_1", "Agenda", 1), style("st_2", "Menú", 2)];

  it("aplicar-lo conserva la distribució del bloc", () => {
    const result = applyNamedStyle(pages(), styles, style("st_3", "Nou", 3), {
      kind: "block",
      placementId: "b",
    });
    const b = result.pages.sheets[0].placements[1];
    expect(b).toMatchObject({ styleId: "st_3", view: { sizePict: 0.5 } });
  });

  it("un nom que ja hi és porta un número", () => {
    expect(uniqueStyleName(styles, "Agenda")).toBe("Agenda 2");
    expect(
      uniqueStyleName([...styles, style("x", "Agenda 2", 9)], "Agenda"),
    ).toBe("Agenda 3");
    expect(uniqueStyleName(styles, "Contes")).toBe("Contes");
    const result = applyNamedStyle(
      pages(),
      styles,
      style("st_3", "Agenda", 3),
      {
        kind: "block",
        placementId: "b",
      },
    );
    expect(result.styles[2].name).toBe("Agenda 2");
  });

  it("compta els blocs de cada estil, els comuns una vegada", () => {
    expect(styleUseCount(pages(), "st_1")).toBe(2);
    expect(styleUseCount(pages(), "st_2")).toBe(1);
    expect(styleUseCount(undefined, "st_1")).toBe(0);
  });

  it("els estils d'una pàgina o d'un bloc, sense repetir ni els que no hi són", () => {
    const withGhost = pages();
    withGhost.sheets[0].placements.push(block("e", "st_x"), block("f", "st_1"));
    expect(
      targetStyleIds(withGhost, styles, { kind: "sheet", sheetIndex: 0 }),
    ).toEqual(["st_1"]);
    expect(
      targetStyleIds(withGhost, styles, { kind: "block", placementId: "d" }),
    ).toEqual(["st_2"]);
    expect(
      targetStyleIds(withGhost, styles, { kind: "block", placementId: "b" }),
    ).toEqual([]);
  });

  it("actualitzar-lo canvia l'estil i es queda el nom, l'id i la distribució d'abans", () => {
    const old = { ...style("st_1", "Agenda", 1), view: { sizePict: 0.8 } };
    const [updated, other] = updateNamedStyles(
      [old, styles[1]],
      ["st_1"],
      style("", "", 4),
    );
    expect(updated).toEqual({
      id: "st_1",
      name: "Agenda",
      pictSequence: card(4),
      view: { sizePict: 0.8 },
    });
    expect(other).toBe(styles[1]);
  });

  it("treure'l d'un bloc el torna a l'estil del document; sense ningú, l'estil surt", () => {
    const once = removeNamedStyle(pages(), styles, "a");
    expect(once.pages.sheets[0].placements[0]).not.toHaveProperty("styleId");
    expect(once.styles.map(({ id }) => id)).toEqual(["st_1", "st_2"]);
    const twice = removeNamedStyle(once.pages, once.styles, "c");
    expect(twice.styles.map(({ id }) => id)).toEqual(["st_2"]);
    const common = removeNamedStyle(twice.pages, twice.styles, "d");
    expect(common.pages.common[0]).not.toHaveProperty("styleId");
    expect(common.styles).toEqual([]);
  });
});
