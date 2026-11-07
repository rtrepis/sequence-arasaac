import { describe, expect, it } from "vitest";
import type { NamedStyle, SequenceViewSettings } from "@/types/document";
import type { Font } from "@/types/sequence";
import {
  TEXT_BLOCK_DEFAULTS,
  blockViewRetouch,
  namedStyleOf,
  resolveBlockView,
  resolveTextBlockStyle,
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
