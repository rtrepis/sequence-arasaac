import { describe, expect, it } from "vitest";
import { createAppStore } from "@app/store";
import {
  regionalPageSizeDetectedActionCreator,
  sessionViewSettingsRestoredActionCreator,
} from "./uiSlice";

// El paper de la regió és per a qui no té preferències desades: AppBootstrap
// el demana en arrencar, i no ha de trepitjar res que mani més que ell

describe("regionalPageSizeDetected", () => {
  it("posa el paper de la regió i deixa la resta del format com estava", () => {
    const store = createAppStore();
    const before = store.getState().ui.viewSettings;

    store.dispatch(regionalPageSizeDetectedActionCreator("LETTER"));

    expect(store.getState().ui.viewSettings).toEqual({
      ...before,
      pageSize: "LETTER",
    });
  });

  it("no toca el format que l'esborrany ja ha restaurat", () => {
    const store = createAppStore();
    const restored = {
      ...store.getState().ui.viewSettings,
      pageSize: "A3" as const,
    };
    store.dispatch(sessionViewSettingsRestoredActionCreator(restored));

    store.dispatch(regionalPageSizeDetectedActionCreator("LETTER"));

    expect(store.getState().ui.viewSettings.pageSize).toBe("A3");
  });
});
