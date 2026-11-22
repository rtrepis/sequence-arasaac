// La fila «Estil» del nivell «Bloc» (pla dels estils, pas 6): el nom de
// l'estil, «Personalitzat» (D13), la marca de reassignat i «Torna a l'estil de
// la seqüència» (D14), i «Canvia…», que obre la galeria per a aquest bloc.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createAppStore } from "@app/store";
import {
  renderWithProviders,
  screen,
  userEvent,
  within,
} from "@/test/renderWithProviders";
import type { SequencePlacement } from "@/types/document";
import { parseSaac } from "@features/sequence/saac/parse";
import { parseContextOf } from "@features/sequence/saac/saacContext";
import { loadDocumentSaacActionCreator } from "@features/sequence/store/documentSlice";
import { findPlacement } from "@features/free-layout/model/sheets";
import BlockStyleRow from "./BlockStyleRow";

const FIXTURES = path.resolve(__dirname, "../../../../../test/fixtures/saac");

/** La fixture 20: «Matí» amb «Sense vores»; el bloc `pl_1` reassignat a «Agenda gran». */
const storeWith20 = () => {
  const store = createAppStore();
  const text = fs.readFileSync(
    path.join(FIXTURES, "20-estil-de-sequencia.saac"),
    "utf8",
  );
  const parsed = parseSaac(text, parseContextOf(store.getState()));
  if (parsed.kind !== "document") throw new Error("no és un document");
  store.dispatch(loadDocumentSaacActionCreator(parsed.document));
  // Sense retocs, perquè es vegi el nom de l'estil
  const pictograms = store.getState().document.content[0].map((pict) => ({
    ...pict,
    settings: {},
    img: { ...pict.img, settings: {} },
  }));
  store.dispatch({
    type: "document/sequencePictogramsReplaced",
    payload: { key: 0, pictograms },
  });
  return store;
};

const placementOf = (
  store: ReturnType<typeof storeWith20>,
  id: string,
): SequencePlacement => {
  const { pages } = store.getState().document;
  const found = pages && findPlacement(pages, id);
  if (!found || found.placement.kind !== "sequence") throw new Error(id);
  return found.placement;
};

describe("BlockStyleRow", () => {
  it("un bloc reassignat diu el seu estil, porta la marca i pot tornar al de la seqüència", async () => {
    const store = storeWith20();
    const { rerender } = renderWithProviders(
      <BlockStyleRow placement={placementOf(store, "pl_1")} name="Matí" />,
      { store },
    );
    expect(screen.getByTestId("block-style-name")).toHaveTextContent(
      "Agenda gran",
    );
    expect(
      screen.getByRole("img", {
        name: "Only this block has this style. The sequence uses “Sense vores”.",
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Back to the sequence style" }),
    );
    rerender(
      <BlockStyleRow placement={placementOf(store, "pl_1")} name="Matí" />,
    );
    expect(placementOf(store, "pl_1").styleId).toBeUndefined();
    expect(screen.getByTestId("block-style-name")).toHaveTextContent(
      "Sense vores",
    );
    expect(screen.queryByTestId("reassigned-mark")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Back to the sequence style" }),
    ).not.toBeInTheDocument();
  });

  it("«Canvia…» obre la galeria del bloc, amb «L'estil de la seqüència» a dalt", async () => {
    const store = storeWith20();
    renderWithProviders(
      <BlockStyleRow placement={placementOf(store, "pl_2")} name="Matí" />,
      { store },
    );
    await userEvent.click(screen.getByRole("button", { name: "Change…" }));
    const gallery = screen.getByRole("dialog", { name: /Style gallery/ });
    const [selected] = within(gallery).getAllByRole("button", {
      current: true,
    });
    expect(selected).toHaveTextContent("The sequence style");
    expect(selected).toHaveTextContent("Sense vores");
  });

  it("amb retocs, «Personalitzat» en lloc del nom", () => {
    const store = createAppStore();
    const text = fs.readFileSync(
      path.join(FIXTURES, "20-estil-de-sequencia.saac"),
      "utf8",
    );
    const parsed = parseSaac(text, parseContextOf(store.getState()));
    if (parsed.kind !== "document") throw new Error("no és un document");
    store.dispatch(loadDocumentSaacActionCreator(parsed.document));
    renderWithProviders(
      <BlockStyleRow placement={placementOf(store, "pl_2")} name="Matí" />,
      { store },
    );
    expect(screen.getByTestId("block-style-name")).toHaveTextContent(
      "Customized",
    );
    expect(
      screen.getByRole("button", { name: /The base style is “Sense vores”/ }),
    ).toBeInTheDocument();
  });
});
