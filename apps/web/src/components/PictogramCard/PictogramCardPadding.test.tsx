// El farciment de la targeta (B40): amb vora exterior, sense vora interior i
// el text a dalt, la imatge no ha de tocar la vora de sota.
import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/renderWithProviders";
import type { PictogramCardDefaults, PictSequence } from "@/types/sequence";
import PictogramCard from "./PictogramCard";

const pictogram: PictSequence = {
  indexSequence: 0,
  img: {
    searched: { word: "esmorzar", bestIdPicts: [6456] },
    selectedId: 6456,
    settings: {},
  },
  settings: {},
  cross: false,
};

const font = { family: "Roboto" as const, color: "#000000", size: 1 };

const defaultsWith = (
  borderOut: number,
  borderIn: number,
): PictogramCardDefaults => ({
  numbered: false,
  textPosition: "top",
  skin: "white",
  hair: "brown",
  color: true,
  font,
  numberFont: font,
  borderOut: { color: "#000000", radius: 4, size: borderOut },
  borderIn: { color: "fitzgerald", radius: 4, size: borderIn },
});

/** El farciment de baix del peu de la targeta (el darrer bloc de contingut). */
const footerPadding = (): string => {
  const card = screen.getByTestId("card-pictogram");
  const footer = card.lastElementChild as HTMLElement;
  const style = getComputedStyle(footer);
  return style.getPropertyValue("padding-block") || style.paddingBottom;
};

describe("el farciment del peu de la targeta (B40)", () => {
  it("amb vora exterior i sense interior, el peu en té", () => {
    renderWithProviders(
      <PictogramCard
        pictogram={pictogram}
        view="complete"
        defaults={defaultsWith(4, 0)}
      />,
    );
    expect(footerPadding()).not.toBe("0px");
  });

  it("sense cap vora, el peu no en té: la imatge arriba a baix", () => {
    renderWithProviders(
      <PictogramCard
        pictogram={pictogram}
        view="complete"
        defaults={defaultsWith(0, 0)}
      />,
    );
    expect(footerPadding()).toBe("0px");
  });
});
