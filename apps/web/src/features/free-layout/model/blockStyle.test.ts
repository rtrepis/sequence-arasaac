import { describe, expect, it } from "vitest";
import type { NamedStyle, SequenceViewSettings } from "@/types/document";
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
  namedStyleFrom,
  namedStyleOf,
  resolveBlockView,
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

  it("un estil sencer, sense l'espai entre seqüències, que és de la pàgina", () => {
    expect(named.view).not.toHaveProperty("sequenceSpaceBetween");
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
