import { describe, it, expect } from "vitest";
import { cloudinaryThumbnailUrl } from "./cloudinaryUrl";

const CLOUDINARY =
  "https://res.cloudinary.com/demo/image/upload/v1699999999/seq/abc123/foto.jpg";

describe("cloudinaryThumbnailUrl", () => {
  it("insereix la transformació just després d'/upload/", () => {
    expect(cloudinaryThumbnailUrl(CLOUDINARY, 40)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_80,c_limit,f_auto,q_auto/v1699999999/seq/abc123/foto.jpg",
    );
  });

  // El doble de la mida de pantalla: en una pantalla de densitat 2x —qualsevol
  // iPad— demanar-la a mida exacta la deixaria borrosa
  it("demana el doble de la mida en què es pinta", () => {
    expect(cloudinaryThumbnailUrl(CLOUDINARY, 24)).toContain("w_48,");
  });

  it("funciona amb una URL sense número de versió", () => {
    expect(
      cloudinaryThumbnailUrl(
        "https://res.cloudinary.com/demo/image/upload/seq/u1/foto.png",
        40,
      ),
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_80,c_limit,f_auto,q_auto/seq/u1/foto.png",
    );
  });

  // Els components l'apliquen sempre, sense saber d'on ve cada imatge: tot el
  // que no sigui de Cloudinary ha de passar de llarg intacte
  it("deixa intactes les URLs que no són de Cloudinary", () => {
    const others = [
      "https://api.arasaac.org/api/pictograms/2462?skin=white",
      "blob:http://localhost:5173/9f8c-1234",
      "../img/settings/white.svg",
      "data:image/webp;base64,AAAA",
    ];
    others.forEach((url) => expect(cloudinaryThumbnailUrl(url, 40)).toBe(url));
  });
});
