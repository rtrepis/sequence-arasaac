import { describe, expect, it } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import { documentStateFixture, sequenceFixture } from "@/test/fixtures/document";
import PictEditModalList from "./PictEditModalList";

describe("PictEditModalList", () => {
  it("hauria de pintar una targeta per cada pictograma de la seqüència", () => {
    const sequence = sequenceFixture(3);

    renderWithProviders(<PictEditModalList sequence={sequence} />, {
      preloadedState: { document: documentStateFixture(sequence) },
    });

    sequence.forEach((_, index) => {
      const name = `pictogram ${index + 1}, pictogram ${index + 1}`;
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
  });

  it("hauria de compartir el porta-retalls entre targetes: copiar en una permet enganxar a l'altra", async () => {
    const sequence = sequenceFixture(2);
    const { store } = renderWithProviders(
      <PictEditModalList sequence={sequence} />,
      { preloadedState: { document: documentStateFixture(sequence) } },
    );

    // Sense res copiat, enganxar no es pot prémer
    await userEvent.pointer({
      target: screen.getByRole("button", { name: "pictogram 1, pictogram 1" }),
      keys: "[MouseRight]",
    });
    expect(
      screen.getByRole("button", { name: "Paste (replaces)" }),
    ).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(screen.getByRole("button", { name: "Copy" }));

    await userEvent.pointer({
      target: screen.getByRole("button", { name: "pictogram 2, pictogram 2" }),
      keys: "[MouseRight]",
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Paste (replaces)" }),
    );

    const [first, second] = store.getState().document.content[0];
    expect(second.text).toBe(first.text);
    expect(second.indexSequence).toBe(1);
  });
});
