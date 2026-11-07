import { describe, expect, it } from "vitest";
import React from "react";
import {
  renderWithProviders,
  screen,
  userEvent,
  within,
} from "@/test/renderWithProviders";
import { sequenceFixture } from "@/test/fixtures/document";
import { createAppStore } from "@/app/store";
import type { DocumentSAAC } from "@/types/document";
import { draftRestoreSettledActionCreator } from "@features/sequence/store/documentStatusSlice";
import ViewSequencePage from "@/pages/ViewSequencePage/ViewSequencePage";

// La columna de la vista en tres nivells (R5, R8): Document, Pàgina N i el
// bloc seleccionat al full. Amb un bloc, Document i Pàgina es pleguen (P1) i
// el nivell «Bloc» canvia només aquell bloc (M1).

const placement = (id: string, sequenceKey: number) => ({
  kind: "sequence" as const,
  id,
  sequenceKey,
  x: 5,
  y: 5,
  w: 100,
  h: 60,
  columns: "auto" as const,
});

const baseDocument = (): DocumentSAAC => ({
  id: "doc",
  content: { 0: sequenceFixture(2), 1: sequenceFixture(3) },
  viewSettings: {},
  activeSAAC: 0,
  layout: { pageSize: "A4", orientation: "portrait", direction: "row" },
});

/** Dues pàgines amb caixes: la seqüència 2 a totes dues. */
const freeDocument = (): DocumentSAAC => ({
  ...baseDocument(),
  pages: {
    sheets: [
      {
        id: "sh_1",
        mode: "template",
        placements: [placement("pl_1", 0), placement("pl_2", 1)],
      },
      { id: "sh_2", mode: "template", placements: [placement("pl_3", 1)] },
    ],
    common: [],
  },
});

const renderView = (document: DocumentSAAC) => {
  const store = createAppStore({ document });
  store.dispatch(draftRestoreSettledActionCreator());
  return renderWithProviders(<ViewSequencePage />, { store });
};

/** El botó que plega o desplega un nivell (el títol i l'abast), pel seu nom. */
const level = (title: RegExp): HTMLElement => {
  const found = screen
    .getAllByRole("button", { name: title })
    .filter((button) => button.hasAttribute("aria-expanded"));
  expect(found).toHaveLength(1);
  return found[0];
};

describe("els nivells de la columna de la vista", () => {
  it("sense res seleccionat, Document i Pàgina són oberts i es diu com s'arriba al bloc", () => {
    renderView(freeDocument());

    expect(level(/^Document/)).toHaveAttribute("aria-expanded", "true");
    expect(level(/^Page\s*Page 1 of 2/)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(
      screen.getByText("Click a block on the page to see its settings."),
    ).toBeInTheDocument();
    // La mida i l'espai dels pictogrames només són del bloc
    expect(screen.queryAllByRole("slider")).toHaveLength(0);
    const crumbs = screen.getByRole("navigation", {
      name: "Where these settings apply",
    });
    expect(within(crumbs).getByText("Page 1 of 2")).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("seleccionar un bloc plega Document i Pàgina i n'ensenya els ajustos", async () => {
    renderView(freeDocument());

    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 2,/ })[1],
    );

    expect(level(/^Document/)).toHaveAttribute("aria-expanded", "false");
    // La pàgina segueix la del bloc
    expect(level(/^Page\s*Page 2 of 2/)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // Les accions del bloc són al seu menú, no a la columna
    expect(
      screen.queryByRole("checkbox", { name: "On every page" }),
    ).not.toBeInTheDocument();
    expect(
      level(/^Block\s*Sequence 2\s*Applies only to this block/),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("el nivell «Bloc» canvia només aquell bloc, no la seqüència", async () => {
    const { store } = renderView(freeDocument());
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 2,/ })[0],
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "Bottom" }).at(-1)!,
    );

    const { pages, viewSettings } = store.getState().document;
    const [, selected] = pages!.sheets[0].placements;
    const [other] = pages!.sheets[1].placements;
    expect(selected).toMatchObject({ view: { alignmentV: "bottom" } });
    expect(other).not.toHaveProperty("view");
    expect(viewSettings[1]?.alignmentV).not.toBe("bottom");
  });

  it("a la disposició automàtica, cada seqüència es selecciona i n'ensenya la vista", async () => {
    const { store } = renderView(baseDocument());

    await userEvent.click(screen.getByRole("button", { name: /^Sequence 1,/ }));

    expect(
      level(/^Block\s*Sequence 1\s*Applies only to this sequence/),
    ).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(
      screen.getAllByRole("button", { name: "Bottom" }).at(-1)!,
    );

    expect(store.getState().document.viewSettings[0]?.alignmentV).toBe(
      "bottom",
    );
    expect(store.getState().document.viewSettings[1]?.alignmentV).not.toBe(
      "bottom",
    );
  });

  it("les molles porten de tornada al nivell «Document» i l'obren", async () => {
    renderView(freeDocument());
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 1,/ })[0],
    );
    expect(level(/^Document/)).toHaveAttribute("aria-expanded", "false");

    const crumbs = screen.getByRole("navigation", {
      name: "Where these settings apply",
    });
    await userEvent.click(
      within(crumbs).getByRole("button", { name: "Document" }),
    );

    expect(level(/^Document/)).toHaveAttribute("aria-expanded", "true");
  });
});
