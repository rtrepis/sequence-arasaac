// Tests de la comptabilitat d'imatges pujades
//
// Cobreixen les funcions pures: les que decideixen si una imatge entra, quant
// pesa i quina és la seva identitat a Cloudinary. La pujada mateixa no es prova
// aquí perquè només és la crida al client de Cloudinary.

import { describe, it, expect } from "vitest";
import {
  MAX_IMAGE_BYTES,
  assertImagesWithinSize,
  base64Bytes,
  estimateIncomingBytes,
  extractPublicId,
  isBase64Image,
  isCloudinaryUrl,
  sumBytes,
  vocabularyAssetFolder,
  type ImageSlot,
} from "./imageAssets";

// Data URL amb el nombre de bytes descodificats demanat
const dataUrl = (bytes: number): string =>
  `data:image/webp;base64,${"A".repeat(Math.ceil((bytes * 4) / 3))}`;

const slot = (url?: string): ImageSlot => ({ url, assign: () => {} });

const CLOUDINARY_URL =
  "https://res.cloudinary.com/demo/image/upload/v1699999999/seq/abc123/vocabulary/foto.jpg";

describe("reconeixement d'URLs", () => {
  it("distingeix un base64 d'una URL de Cloudinary", () => {
    expect(isBase64Image(dataUrl(10))).toBe(true);
    expect(isBase64Image(CLOUDINARY_URL)).toBe(false);
    expect(isCloudinaryUrl(CLOUDINARY_URL)).toBe(true);
    expect(isCloudinaryUrl(dataUrl(10))).toBe(false);
  });

  it("no considera imatge una URL absent ni una d'ARASAAC", () => {
    expect(isBase64Image(undefined)).toBe(false);
    expect(isCloudinaryUrl(undefined)).toBe(false);
    expect(isCloudinaryUrl("https://api.arasaac.org/api/pictograms/2462")).toBe(false);
  });
});

describe("extractPublicId", () => {
  it("treu el public_id d'una URL segura, amb versió i sense", () => {
    expect(extractPublicId(CLOUDINARY_URL)).toBe("seq/abc123/vocabulary/foto");
    expect(
      extractPublicId("https://res.cloudinary.com/demo/image/upload/seq/u1/foto.png")
    ).toBe("seq/u1/foto");
  });

  // Una URL que no en dona cap no ha de retornar un public_id inventat: esborrar
  // per un public_id equivocat esborraria la imatge d'algú altre
  it("retorna cadena buida si la URL no té la forma esperada", () => {
    expect(extractPublicId("https://example.com/foto.jpg")).toBe("");
  });
});

describe("pes de les imatges", () => {
  it("calcula els bytes descodificats d'un data URL", () => {
    expect(base64Bytes(dataUrl(1024))).toBe(1024);
  });

  it("només compta les imatges noves, no les que ja són a Cloudinary", () => {
    const slots = [slot(dataUrl(2048)), slot(CLOUDINARY_URL), slot(undefined)];
    expect(estimateIncomingBytes(slots)).toBe(2048);
  });

  it("suma els bytes d'un conjunt d'imatges desades", () => {
    expect(sumBytes([{ publicId: "a", bytes: 100 }, { publicId: "b", bytes: 250 }])).toBe(350);
  });
});

describe("assertImagesWithinSize", () => {
  it("deixa passar una imatge que arriba just al sostre", () => {
    expect(() => assertImagesWithinSize([slot(dataUrl(MAX_IMAGE_BYTES))])).not.toThrow();
  });

  it("rebutja amb IMAGE_TOO_LARGE la que el passa", () => {
    expect(() =>
      assertImagesWithinSize([slot(CLOUDINARY_URL), slot(dataUrl(MAX_IMAGE_BYTES + 1024))])
    ).toThrow("IMAGE_TOO_LARGE");
  });

  it("no mira les imatges que ja són a Cloudinary", () => {
    expect(() => assertImagesWithinSize([slot(CLOUDINARY_URL)])).not.toThrow();
  });
});

describe("carpetes", () => {
  // El vocabulari penja de la carpeta del compte: esborrar el compte és esborrar
  // aquest prefix, i una carpeta germana quedaria orfe per sempre
  it("posa el vocabulari dins la carpeta de l'usuari", () => {
    expect(vocabularyAssetFolder("u1").startsWith("seq/u1")).toBe(true);
  });
});
