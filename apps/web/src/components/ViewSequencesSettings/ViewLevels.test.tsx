import { describe, expect, it } from "vitest";
import React from "react";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitForElementToBeRemoved,
  within,
} from "@/test/renderWithProviders";
import { sequenceFixture } from "@/test/fixtures/document";
import { createAppStore } from "@/app/store";
import type { DocumentSAAC } from "@/types/document";
import { draftRestoreSettledActionCreator } from "@features/sequence/store/documentStatusSlice";
import ViewSequencePage from "@/pages/ViewSequencePage/ViewSequencePage";
import { FeedbackSnackbar } from "@/context/FeedbackContext";
import StyleUndoSnackbar from "@features/sequence/components/DocumentStyle/StyleUndoSnackbar";

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
  // L'avís de les accions el pinta l'app (`FeedbackSnackbar`), no la pàgina
  return renderWithProviders(
    <>
      <ViewSequencePage />
      <FeedbackSnackbar />
    </>,
    { store },
  );
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
    // La mida, l'espai i l'alineació són del bloc: sense cap de seleccionat,
    // no hi són
    expect(
      screen.queryByRole("slider", { name: "Size" }),
    ).not.toBeInTheDocument();
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

  it("sense «la mateixa», el nivell «Bloc» canvia només aquell bloc, no la seqüència", async () => {
    const { store } = renderView(freeDocument());
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 2,/ })[0],
    );
    // «Igual a tots els blocs» és al nivell del bloc
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Same for every block" }),
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

  it("amb la mateixa configuració, la pàgina la posa a tots els blocs i el bloc no en té", async () => {
    const { store } = renderView(freeDocument());

    // Des de qualsevol bloc, amb «Igual a tots els blocs» activat
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 1,/ })[0],
    );
    expect(
      screen.getByRole("checkbox", { name: "Same for every block" }),
    ).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Bottom" }));

    store
      .getState()
      .document.pages!.sheets[0].placements.forEach((placement) =>
        expect(placement).toMatchObject({ view: { alignmentV: "bottom" } }),
      );
    // L'altra pàgina no canvia
    expect(
      store.getState().document.pages!.sheets[1].placements[0],
    ).not.toHaveProperty("view");

    // S'obre el nivell del bloc
    expect(
      level(/^Block\s*Sequence 1\s*Applies only to this block/),
    ).toHaveAttribute("aria-expanded", "true");
    // En blocs, cada bloc tria les columnes de dins
    expect(
      screen.getByRole("combobox", { name: "Columns" }),
    ).toBeInTheDocument();
  });

  it("activar «la mateixa» posa a tots la configuració del més petit, i ho diu", async () => {
    const document = freeDocument();
    const [first] = document.pages!.sheets[0].placements;
    const { store } = renderView({
      ...document,
      pages: {
        ...document.pages!,
        sheets: [
          {
            ...document.pages!.sheets[0],
            placements: [
              first,
              {
                ...placement("pl_2", 1),
                view: { sizePict: 0.5, alignmentH: "left" as const },
              },
            ],
          },
          document.pages!.sheets[1],
        ],
      },
    });
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 1,/ })[0],
    );
    const uniform = screen.getByRole("checkbox", {
      name: "Same for every block",
    });
    expect(uniform).not.toBeChecked();

    await userEvent.click(uniform);

    store
      .getState()
      .document.pages!.sheets[0].placements.forEach((placement) =>
        expect(placement).toMatchObject({ view: { sizePict: 0.5 } }),
      );
    expect(
      await screen.findByText(
        "Every block on the page now has the size, spacing and alignment of the smallest one: Sequence 2.",
      ),
    ).toBeInTheDocument();
  });

  it("a la disposició automàtica, sense «la mateixa», cada seqüència té la seva vista", async () => {
    const { store } = renderView(baseDocument());
    await userEvent.click(screen.getByRole("button", { name: /^Sequence 1,/ }));
    // A la pàgina contínua són seqüències, no blocs
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Same for every sequence" }),
    );

    expect(
      level(/^Sequence\s*Sequence 1\s*Applies only to this sequence/),
    ).toHaveAttribute("aria-expanded", "true");
    // Les columnes de dins només són de les pàgines en blocs
    expect(
      screen.queryByRole("combobox", { name: "Columns" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Bottom" }));

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

describe("plantilles amb rètols a la columna (R4, R9)", () => {
  it("triar «Primer / Després» reparteix la pàgina, n'estrena els rètols i es pot desfer", async () => {
    const store = createAppStore({ document: freeDocument() });
    store.dispatch(draftRestoreSettledActionCreator());
    // El «Desfés» el pinta el layout de l'app
    renderWithProviders(
      <>
        <ViewSequencePage />
        <StyleUndoSnackbar placement="layout" />
      </>,
      { store },
    );

    await userEvent.click(screen.getByRole("button", { name: "First / Then" }));

    expect(
      screen.getByRole("button", { name: "Label: First" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Label: Then" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "First / Then" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    expect(
      screen.queryByRole("button", { name: "Label: First" }),
    ).not.toBeInTheDocument();
  });

  it("seleccionar un rètol n'ensenya el text i la lletra, i canviar-lo canvia el full", async () => {
    renderView(freeDocument());
    await userEvent.click(screen.getByRole("button", { name: "First / Then" }));
    await userEvent.click(screen.getByRole("button", { name: "Label: First" }));

    expect(level(/^Label\s*First/)).toHaveAttribute("aria-expanded", "true");
    const field = screen.getByRole("textbox", { name: "Text" });
    await userEvent.clear(field);
    await userEvent.type(field, "Now");

    expect(
      screen.getByRole("button", { name: "Label: Now" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Bold" })).toBeChecked();
    expect(screen.getByRole("slider", { name: "Font size" })).toHaveValue(
      "1.25",
    );
  });
});

describe("una plantilla on no hi cap tot (R4)", () => {
  it("abans d'aplicar-la diu què sortirà de la pàgina, i només ho fa si s'accepta", async () => {
    renderView(freeDocument());

    // L'agenda en tira té un sol espai, i la pàgina 1 té dues seqüències
    await userEvent.click(
      screen.getByRole("button", { name: "Schedule strip" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Apply “Schedule strip” to page 1?",
    });
    expect(dialog).toHaveTextContent(
      "One block doesn't fit and will leave this page: Sequence 2.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(
      screen.getAllByRole("button", { name: /^Sequence 2,/ }),
    ).toHaveLength(2);

    await userEvent.click(
      screen.getByRole("button", { name: "Schedule strip" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Apply it" }));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    // A la pàgina 1 només hi queda la seqüència 1; la 2 continua a la pàgina 2
    expect(
      screen.getAllByRole("button", { name: /^Sequence 2,/ }),
    ).toHaveLength(1);
  });
});

describe("afegir pàgines des de l'inici", () => {
  it("un document sense pàgines pròpies té la capçalera de la pàgina, i el menú hi afegeix una pàgina", async () => {
    renderView(baseDocument());

    expect(
      screen.getByRole("heading", { name: "Page 1 of 1" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "More page actions" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Add a page" }));

    expect(
      await screen.findByRole("heading", { name: "Page 2 of 2" }),
    ).toBeInTheDocument();
  });
});

describe("els estils de bloc (R7)", () => {
  /** Els blocs 1 i 3 fan servir l'estil de bloc «Agenda». */
  const styledDocument = (): DocumentSAAC => {
    const document = freeDocument();
    const [first, second] = document.pages?.sheets ?? [];
    first.placements[0] = { ...placement("pl_1", 0), styleId: "st_1" };
    second.placements[0] = { ...placement("pl_3", 1), styleId: "st_1" };
    return {
      ...document,
      styles: [
        {
          id: "st_1",
          name: "Agenda",
          pictSequence: { textPosition: "top" },
        },
      ],
    };
  };

  it("el nivell «Bloc» diu quin estil de bloc fa servir i quants blocs el comparteixen", async () => {
    renderView(styledDocument());

    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 1,/ })[0],
    );
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(
      screen.getByText(/^2 blocks use it: “Update with my style”/),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 2,/ })[0],
    );
    expect(screen.getByText("The document's style")).toBeInTheDocument();
  });

  it("el menú del bloc el treu, i només a aquell bloc", async () => {
    const { store } = renderView(styledDocument());

    await userEvent.click(
      screen.getAllByRole("button", { name: "Actions for Sequence 1" })[0],
    );
    expect(
      screen.getByRole("menuitem", { name: "Update with my style" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("menuitem", { name: "Remove the block style" }),
    );

    const [first, second] = store.getState().document.pages?.sheets ?? [];
    expect(first.placements[0]).not.toHaveProperty("styleId");
    expect(second.placements[0]).toMatchObject({ styleId: "st_1" });
    expect(store.getState().document.styles).toHaveLength(1);
    // El missatge és el snackbar amb «Desfés»
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "blockStyleRemove",
    });
  });

  it("un bloc sense estil de bloc no ofereix actualitzar-lo ni treure'l", async () => {
    renderView(styledDocument());
    await userEvent.click(
      screen.getAllByRole("button", { name: "Actions for Sequence 2" })[0],
    );
    expect(
      screen.getByRole("menuitem", { name: "Apply my style" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Update with my style" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Remove the block style" }),
    ).not.toBeInTheDocument();
  });
});

describe("la disposició de la pàgina, en una sola fila", () => {
  it("simple, columnes, files o lliure, sense cap fila de repartiment a part", async () => {
    const { store } = renderView(baseDocument());
    const group = screen.getByRole("group", { name: /^Layout/ });
    expect(
      within(group).getByRole("button", { name: /^Simple/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("group", { name: "Arrange by" })).toBeNull();

    await userEvent.click(
      within(group).getByRole("button", { name: "In columns" }),
    );

    const [sheet] = store.getState().document.pages?.sheets ?? [];
    expect(sheet.mode).toBe("template");
    expect(sheet.template).toBe("columns-2");
    expect(
      within(screen.getByRole("group", { name: /^Layout/ })).getByRole(
        "button",
        { name: "In columns" },
      ),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
