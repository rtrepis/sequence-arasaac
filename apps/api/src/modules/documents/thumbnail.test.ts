// Tests de la derivació de la miniatura d'un document

import { describe, it, expect } from "vitest";
import { buildDocumentThumbnail, THUMBNAIL_MAX_PICTS } from "./thumbnail";
import type { CreateDocumentInput } from "./validators";

type Content = CreateDocumentInput["content"];

// Pictograma mínim vàlid segons l'esquema d'entrada
const pict = (
  indexSequence: number,
  selectedId: number,
  url?: string
): Content[string][number] => ({
  indexSequence,
  img: {
    searched: { word: `paraula-${selectedId}`, bestIdPicts: [selectedId] },
    selectedId,
    settings: { skin: "white", hair: "brown", color: true },
    ...(url ? { url } : {}),
  },
  cross: false,
  settings: {},
});

describe("buildDocumentThumbnail", () => {
  it("hauria d'agafar els primers pictogrames de la primera seqüència", () => {
    const content: Content = { "0": [pict(0, 1), pict(1, 2), pict(2, 3), pict(3, 4)] };

    const thumbnail = buildDocumentThumbnail(content);

    expect(thumbnail).toHaveLength(THUMBNAIL_MAX_PICTS);
    expect(thumbnail.map((p) => p.selectedId)).toEqual([1, 2, 3]);
  });

  it("hauria de conservar l'aparença del pictograma", () => {
    const thumbnail = buildDocumentThumbnail({ "0": [pict(0, 1)] });

    expect(thumbnail[0]).toEqual({
      selectedId: 1,
      skin: "white",
      hair: "brown",
      color: true,
    });
  });

  it("hauria d'ordenar per indexSequence i no per posició a l'array", () => {
    const content: Content = { "0": [pict(2, 3), pict(0, 1), pict(1, 2)] };

    const thumbnail = buildDocumentThumbnail(content);

    expect(thumbnail.map((p) => p.selectedId)).toEqual([1, 2, 3]);
  });

  it("hauria de continuar a la seqüència següent si la primera és buida", () => {
    const content: Content = { "0": [], "1": [pict(0, 7)] };

    const thumbnail = buildDocumentThumbnail(content);

    expect(thumbnail.map((p) => p.selectedId)).toEqual([7]);
  });

  it("hauria de respectar l'ordre de seqüències triat per l'usuari", () => {
    const content: Content = { "0": [pict(0, 1)], "1": [pict(0, 2)] };

    const thumbnail = buildDocumentThumbnail(content, [1, 0]);

    expect(thumbnail.map((p) => p.selectedId)).toEqual([2, 1]);
  });

  it("hauria de conservar la URL d'una imatge personalitzada ja pujada", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/v1/seq/abc.png";

    const thumbnail = buildDocumentThumbnail({ "0": [pict(0, 1, url)] });

    expect(thumbnail[0].url).toBe(url);
  });

  it("no hauria de desar mai un base64 a la miniatura", () => {
    const base64 = "data:image/png;base64,AAAA";

    const thumbnail = buildDocumentThumbnail({ "0": [pict(0, 1, base64)] });

    expect(thumbnail[0].url).toBeUndefined();
  });

  it("hauria de retornar una miniatura buida amb un document sense pictogrames", () => {
    expect(buildDocumentThumbnail({ "0": [] })).toEqual([]);
  });
});
