// La capçalera de la seqüència a l'edició (pla dels estils, pas 5): el nom,
// l'estil o «Personalitzat» (només amb retocs, D13), el «⋯» amb la Galeria
// d'estils, i treure la seqüència oberta (D21).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createAppStore } from "@app/store";
import {
  fireEvent,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  within,
} from "@/test/renderWithProviders";
import { parseSaac } from "@features/sequence/saac/parse";
import { parseContextOf } from "@features/sequence/saac/saacContext";
import {
  buildStyleFileV3,
  serializeSaac,
} from "@features/sequence/saac/serialize";
import { selectUserDefaultStyle } from "@features/sequence/style/styleSelectors";
import { loadDocumentSaacActionCreator } from "@features/sequence/store/documentSlice";
import SequenceHeader from "./SequenceHeader";

const FIXTURES = path.resolve(__dirname, "../../../../../test/fixtures/saac");

/** La fixture 20: «Matí» (0), «Tarda» (1, sense nom ni estil) i «Nit» (2), totes amb un pictograma retocat. */
const storeWith20 = () => {
  const store = createAppStore();
  const text = fs.readFileSync(
    path.join(FIXTURES, "20-estil-de-sequencia.saac"),
    "utf8",
  );
  const parsed = parseSaac(text, parseContextOf(store.getState()));
  if (parsed.kind !== "document") throw new Error("no és un document");
  store.dispatch(loadDocumentSaacActionCreator(parsed.document));
  return store;
};

describe("SequenceHeader", () => {
  it("diu el nom de l'estil, i «Personalitzat» només si hi ha retocs", () => {
    const store = storeWith20();
    const { unmount } = renderWithProviders(
      <SequenceHeader sequenceKey={2} />,
      { store },
    );
    expect(screen.getByRole("heading", { name: "Nit" })).toBeInTheDocument();
    // «Nit» té un pictograma retocat
    expect(screen.getByTestId("sequence-style")).toHaveTextContent(
      "Style: Customized",
    );
    expect(
      screen.getByRole("button", { name: /The base style is “Agenda gran”/ }),
    ).toBeInTheDocument();
    unmount();

    // Sense retocs, el nom de l'estil (el del document, que no en té de propi)
    const pictograms = store.getState().document.content[1].map((pict) => ({
      ...pict,
      settings: {},
      img: { ...pict.img, settings: {} },
    }));
    store.dispatch({
      type: "document/sequencePictogramsReplaced",
      payload: { key: 1, pictograms },
    });
    renderWithProviders(<SequenceHeader sequenceKey={1} />, { store });
    expect(screen.getByRole("heading", { name: "Sequence 2" })).toBeVisible();
    expect(screen.getByTestId("sequence-style")).toHaveTextContent(
      "Style: El meu estil",
    );
    expect(
      screen.queryByRole("button", { name: /The base style/ }),
    ).not.toBeInTheDocument();
  });

  it("tria el meu estil a la galeria des del «⋯», i el snackbar ho diu", async () => {
    const store = storeWith20();
    renderWithProviders(<SequenceHeader sequenceKey={1} />, { store });
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for “Sequence 2”" }),
    );
    await userEvent.click(
      screen.getByRole("menuitem", { name: /Style: .* — Change…/ }),
    );
    const gallery = screen.getByRole("dialog", { name: /Style gallery/ });
    // La primera opció, marcada: la seqüència no en té de propi
    const options = within(gallery).getAllByRole("button", {
      current: true,
    });
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("The document style");

    await userEvent.click(
      within(gallery).getByRole("button", { name: /^My style/ }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(store.getState().document.sequenceStyleIds?.[1]).toBeDefined();
    expect(store.getState().style.undoSnackbar?.details).toMatchObject({
      styleName: "My style",
      retouched: 1,
    });
  });

  it("«Carrega d'un fitxer…» aplica l'estil i no el deixa a la galeria (D17)", async () => {
    const store = storeWith20();
    renderWithProviders(<SequenceHeader sequenceKey={1} />, { store });
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for “Sequence 2”" }),
    );
    await userEvent.click(
      screen.getByRole("menuitem", { name: /Style: .* — Change…/ }),
    );
    const style = {
      ...selectUserDefaultStyle(store.getState()),
    };
    style.pictSequence = { ...style.pictSequence, numbered: false };
    const file = new File(
      [serializeSaac(buildStyleFileV3(style, "Del fitxer"))],
      "estil.saacstyle",
    );
    fireEvent.change(screen.getByTestId("style-gallery-file"), {
      target: { files: [file] },
    });
    await waitFor(() =>
      expect(store.getState().document.sequenceStyleIds?.[1]).toBeDefined(),
    );
    const { document } = store.getState();
    expect(
      document.styles?.find(({ id }) => id === document.sequenceStyleIds?.[1])
        ?.name,
    ).toBe("Del fitxer");

    // Tornant a obrir la galeria, només hi ha les opcions de sempre
    await userEvent.click(
      await screen.findByRole("button", { name: "Actions for “Sequence 2”" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: /— Change…/ }));
    const gallery = screen.getByRole("dialog", { name: /Style gallery/ });
    expect(within(gallery).queryByText("Del fitxer")).not.toBeInTheDocument();
  });

  it("«Treu aquesta seqüència» treu l'oberta, amb confirmació si té pictogrames", async () => {
    const store = storeWith20();
    renderWithProviders(<SequenceHeader sequenceKey={1} />, { store });
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for “Sequence 2”" }),
    );
    await userEvent.click(
      screen.getByRole("menuitem", { name: "Remove this sequence" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Remove sequence" }),
    );
    expect(store.getState().document.sequenceNames).toEqual({
      0: "Matí",
      1: "Nit",
    });
  });

  it("canvia el nom", async () => {
    const store = storeWith20();
    renderWithProviders(<SequenceHeader sequenceKey={1} />, { store });
    await userEvent.click(screen.getByRole("button", { name: "Rename" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Sequence name" }),
      "Tarda{Enter}",
    );
    expect(store.getState().document.sequenceNames?.[1]).toBe("Tarda");
    expect(
      await screen.findByRole("heading", { name: "Tarda" }),
    ).toBeInTheDocument();
  });
});
