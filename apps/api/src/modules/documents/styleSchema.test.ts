// Tests de l'estil dels documents desats al núvol (esquema 2 del .saac)
//
// «Desa el document» inclou sempre l'estil, també al núvol: el client envia
// `defaultSettings` i `styleView`, i els ha de tornar a rebre tal com els va
// enviar. Els documents d'abans no en porten i s'han de continuar acceptant.
// Vegeu docs/fonaments/sequencia-i-estil.md.
//
// No toquen la base de dades: el model es construeix en memòria i
// `serializeDocument` és el mateix camí que fa servir qualsevol lectura.

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import { createDocumentSchema } from "./validators";
import { DocumentModel, serializeDocument } from "./model";
import { compactContent } from "./contentStorage";

const font = { family: "Escolar", color: "#1a237e", size: 1.2 };
const border = { color: "#000000", radius: 10, size: 2 };

const defaultSettings = {
  pictSequence: {
    numbered: true,
    textPosition: "top" as const,
    font,
    numberFont: font,
    borderOut: border,
    borderIn: border,
  },
  pictApiAra: { hair: "red", skin: "black", fitzgerald: "#666666", color: true },
};

const styleView = {
  sizePict: 1.5,
  pictSpaceBetween: 2,
  alignmentH: "center" as const,
  alignmentV: "top" as const,
  sequenceSpaceBetween: 3,
};

const pict = {
  indexSequence: 0,
  img: {
    searched: { word: "casa", bestIdPicts: [1] },
    selectedId: 1,
    settings: { fitzgerald: "#ff0000" },
  },
  cross: false,
  settings: { textPosition: "top" as const, font: { ...font }, borderIn: { ...border } },
};

const body = {
  title: "Rutina",
  content: { "0": [pict] },
  viewSettings: {
    "0": { sizePict: 1.5, pictSpaceBetween: 2, alignmentH: "center", alignmentV: "top" },
  },
  activeSAAC: 0,
};

describe("validació de l'estil en desar", () => {
  it("accepta un document amb l'estil sencer (esquema 2)", () => {
    const parsed = createDocumentSchema.parse({ ...body, defaultSettings, styleView });
    expect(parsed.styleView).toEqual(styleView);
    expect(parsed.defaultSettings).toEqual(defaultSettings);
  });

  it("continua acceptant un document d'abans, sense estil", () => {
    const parsed = createDocumentSchema.parse(body);
    expect(parsed.defaultSettings).toBeUndefined();
    expect(parsed.styleView).toBeUndefined();
  });

  it("accepta la disposició (B26) i en rebutja els valors que no existeixen", () => {
    const layout = { direction: "column", pageSize: "A3", orientation: "portrait" };
    expect(createDocumentSchema.parse({ ...body, layout }).layout).toEqual(layout);
    expect(() =>
      createDocumentSchema.parse({ ...body, layout: { pageSize: "A5" } })
    ).toThrow();
  });

  it("rebutja una vista d'estil incompleta", () => {
    const { sequenceSpaceBetween: _omitted, ...incomplete } = styleView;
    expect(() =>
      createDocumentSchema.parse({ ...body, styleView: incomplete })
    ).toThrow();
  });
});

describe("lectura de l'estil desat", () => {
  it("el document torna amb el mateix estil que es va desar", () => {
    const input = createDocumentSchema.parse({
      ...body,
      defaultSettings,
      styleView,
      layout: { direction: "row" },
    });
    // El mateix que fa el servei just abans d'escriure
    compactContent(input.content, input.defaultSettings?.pictSequence);

    const doc = new DocumentModel({
      userId: new Types.ObjectId(),
      ...input,
    });
    const serialized = serializeDocument(doc);

    expect(serialized.defaultSettings).toEqual(defaultSettings);
    expect(serialized.styleView).toEqual(styleView);
    expect(serialized.layout).toEqual({ direction: "row" });
    // Els ajustos del pictograma que coincidien amb l'estil es tornen a posar
    expect(serialized.content[0][0].settings.font).toEqual(font);
    expect(serialized.content[0][0].settings.borderIn).toEqual(border);
  });

  it("un document d'abans surt sense claus d'estil buides", () => {
    const doc = new DocumentModel({
      userId: new Types.ObjectId(),
      ...createDocumentSchema.parse(body),
    });
    const serialized = serializeDocument(doc);

    expect("styleView" in serialized).toBe(false);
    expect("layout" in serialized).toBe(false);
    expect(serialized.defaultSettings).toBeUndefined();
  });
});
