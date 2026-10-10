import { describe, expect, it } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/renderWithProviders";
import {
  documentStateFixture,
  sequenceFixture,
} from "@/test/fixtures/document";
import { Sequence } from "@/types/sequence";
import PictEditModal from "./PictEditModal";

/**
 * La targeta sempre edita un pictograma del document obert: es monta amb la
 * seqüència ja a l'store, com a la graella d'edició.
 */
const renderCard = (sequence: Sequence, index = 0) =>
  renderWithProviders(<PictEditModal pictogram={sequence[index]} />, {
    preloadedState: { document: documentStateFixture(sequence) },
  });

const cardName = (index: number) =>
  `pictogram ${index + 1}, pictogram ${index + 1}`;

describe("PictEditModal", () => {
  it("hauria de mostrar la targeta amb el text i el número del pictograma", () => {
    renderCard(sequenceFixture(1));

    expect(
      screen.getByRole("button", { name: cardName(0) }),
    ).toBeInTheDocument();
  });

  it("hauria de dir al nom accessible que el pictograma té retocs propis", () => {
    const sequence = sequenceFixture(1);
    sequence[0].settings.borderIn = { color: "#112233", radius: 4, size: 3 };

    renderCard(sequence);

    expect(
      screen.getByRole("button", { name: `${cardName(0)}, customised` }),
    ).toBeInTheDocument();
  });

  it("hauria d'obrir el diàleg d'edició en clicar la targeta", async () => {
    renderCard(sequenceFixture(1));

    await userEvent.click(screen.getByRole("button", { name: cardName(0) }));

    expect(
      screen.getByRole("heading", { name: "Edit Pictogram" }),
    ).toBeInTheDocument();
  });

  it("hauria de tancar el diàleg amb el botó de tancar", async () => {
    renderCard(sequenceFixture(1));
    await userEvent.click(screen.getByRole("button", { name: cardName(0) }));

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Edit Pictogram" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("hauria de treure el pictograma del document i renumerar la resta", async () => {
    const sequence = sequenceFixture(2);
    const { store } = renderCard(sequence);
    await userEvent.click(screen.getByRole("button", { name: cardName(0) }));

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    const remaining = store.getState().document.content[0];
    expect(remaining).toHaveLength(1);
    expect(remaining[0].text).toBe("pictogram 2");
    expect(remaining[0].indexSequence).toBe(0);
  });

  it("hauria de desar al document el text editat damunt de la targeta", async () => {
    const sequence = sequenceFixture(1);
    const { store } = renderCard(sequence);

    await userEvent.click(screen.getByText("pictogram 1"));
    const input = screen.getByRole("textbox", { name: "Text of pictogram 1" });
    await userEvent.clear(input);
    await userEvent.type(input, "esmorzar{Enter}");

    expect(store.getState().document.content[0][0].text).toBe("esmorzar");
  });

  it("no hauria de tocar el document si el text no ha canviat", async () => {
    const sequence = sequenceFixture(1);
    const { store } = renderCard(sequence);
    const documentBefore = store.getState().document;

    await userEvent.click(screen.getByText("pictogram 1"));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Text of pictogram 1" }),
      "{Enter}",
    );

    expect(store.getState().document).toBe(documentBefore);
  });

  it("hauria de moure el pictograma després des del menú contextual", async () => {
    const sequence = sequenceFixture(3);
    const { store } = renderCard(sequence, 0);

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", { name: cardName(0) }),
    });

    // El primer no es pot moure abans
    expect(
      screen.queryByRole("button", { name: "Move before" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Move after" }));

    expect(
      store.getState().document.content[0].map(({ text }) => text),
    ).toEqual(["pictogram 2", "pictogram 1", "pictogram 3"]);
  });
});
