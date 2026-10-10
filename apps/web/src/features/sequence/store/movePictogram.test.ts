import { describe, expect, it } from "vitest";
import { createAppStore } from "@app/store";
import {
  documentStateFixture,
  sequenceFixture,
} from "@/test/fixtures/document";
import { movePictogramActionCreator } from "./documentSlice";

// Canviar l'ordre dels pictogrames de la seqüència activa a la pàgina d'edició

const makeStore = () =>
  createAppStore({ document: documentStateFixture(sequenceFixture(3)) });

const textsOf = (store: ReturnType<typeof makeStore>) =>
  store.getState().document.content[0].map((pictogram) => pictogram.text);

const indexesOf = (store: ReturnType<typeof makeStore>) =>
  store
    .getState()
    .document.content[0].map((pictogram) => pictogram.indexSequence);

describe("movePictogram", () => {
  it("hauria de moure un pictograma una posició enrere i renumerar", () => {
    const store = makeStore();

    store.dispatch(movePictogramActionCreator({ from: 2, to: 1 }));

    expect(textsOf(store)).toEqual([
      "pictogram 1",
      "pictogram 3",
      "pictogram 2",
    ]);
    expect(indexesOf(store)).toEqual([0, 1, 2]);
  });

  it("hauria de moure un pictograma una posició endavant", () => {
    const store = makeStore();

    store.dispatch(movePictogramActionCreator({ from: 0, to: 1 }));

    expect(textsOf(store)).toEqual([
      "pictogram 2",
      "pictogram 1",
      "pictogram 3",
    ]);
  });

  it("no hauria de fer res fora dels límits de la seqüència", () => {
    const store = makeStore();

    store.dispatch(movePictogramActionCreator({ from: 0, to: -1 }));
    store.dispatch(movePictogramActionCreator({ from: 2, to: 3 }));

    expect(textsOf(store)).toEqual([
      "pictogram 1",
      "pictogram 2",
      "pictogram 3",
    ]);
  });
});
