import { describe, expect, it, vi } from "vitest";
import React, { useEffect } from "react";
import {
  renderWithProviders,
  screen,
  userEvent,
  within,
} from "@/test/renderWithProviders";
import { sequenceFixture } from "@/test/fixtures/document";
import type { DocumentSAAC } from "@/types/document";
import { useBeforePrintCheck } from "@features/free-layout/hooks/useBeforePrintCheck";
import {
  ViewSelectionProvider,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import { templateById } from "@features/free-layout/model/templates";
import FreeLayoutPages from "./FreeLayoutPages";

// Les pàgines del mode lliure (ADR-005): cada pàgina és un full que
// s'imprimeix, amb les seves caixes i les comunes; la selecció d'un bloc (R5);
// i l'avís abans d'imprimir.

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

/** Tres seqüències: la 0 a totes les pàgines, la 1 a les dues, la 2 enlloc. */
const freeDocument = (): DocumentSAAC => ({
  id: "doc",
  content: {
    0: sequenceFixture(2),
    1: sequenceFixture(3),
    2: sequenceFixture(1),
  },
  viewSettings: {},
  activeSAAC: 0,
  layout: {
    pageSize: "A4",
    orientation: "portrait",
    direction: "row",
  },
  pages: {
    sheets: [
      { id: "sh_1", mode: "template", placements: [placement("pl_1", 1)] },
      { id: "sh_2", mode: "template", placements: [placement("pl_2", 1)] },
    ],
    common: [placement("pl_9", 0)],
  },
});

const renderPages = (document: DocumentSAAC = freeDocument()) =>
  renderWithProviders(
    <ViewSelectionProvider>
      <FreeLayoutPages
        pageDimensions={{ width: 756, height: 1085 }}
        displayWidth={378}
        displayHeight={542}
        scale={0.5}
        author=""
      />
    </ViewSelectionProvider>,
    { preloadedState: { document } },
  );

describe("FreeLayoutPages", () => {
  it("pinta un full per pàgina, amb les seves caixes i les comunes", () => {
    const { container } = renderPages();

    expect(container.querySelectorAll(".preview-content")).toHaveLength(2);
    // La comuna surt a les dues pàgines; la 1, a cadascuna
    expect(
      screen.getAllByRole("button", {
        name: /^Sequence 1, 2 pictograms, on every page$/,
      }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /^Sequence 2, 3 pictograms$/ }),
    ).toHaveLength(2);
  });

  it("clicar un bloc el selecciona sense obrir cap menú, i Escape el deixa", async () => {
    renderPages();
    const [block] = screen.getAllByRole("button", { name: /^Sequence 2,/ });
    expect(block).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(block);

    expect(block).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    // La pàgina del bloc és la que segueix la columna
    expect(screen.getAllByRole("region")[0]).toHaveAttribute(
      "aria-current",
      "true",
    );

    await userEvent.keyboard("{Escape}");

    expect(block).toHaveAttribute("aria-pressed", "false");
  });

  it("amb el teclat, Enter selecciona; el clic fora de cap bloc treu la selecció", async () => {
    renderPages();
    const [, block] = screen.getAllByRole("button", { name: /^Sequence 2,/ });
    block.focus();

    await userEvent.keyboard("{Enter}");

    expect(block).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("region")[1]).toHaveAttribute(
      "aria-current",
      "true",
    );

    await userEvent.click(
      block.closest(".preview-content")!.parentElement as HTMLElement,
    );

    expect(block).toHaveAttribute("aria-pressed", "false");
  });

  it("el menú del bloc és al seu botó, i «A totes les pàgines» hi diu com és", async () => {
    renderPages();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Actions for Sequence 1" })[0],
    );

    expect(
      screen.getByRole("menuitemcheckbox", { name: "On every page" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("el peu de llicència va a totes les pàgines o només a l'última", () => {
    const { container, unmount } = renderPages();
    expect(container.querySelectorAll(".print-copyright")).toHaveLength(2);
    unmount();

    const document = freeDocument();
    const last = renderPages({
      ...document,
      pages: { ...document.pages!, licenceOn: "last" },
    });
    const sheets = last.container.querySelectorAll(".preview-content");
    expect(sheets[0].querySelector(".print-copyright")).toBeNull();
    expect(sheets[1].querySelector(".print-copyright")).not.toBeNull();
  });

  it("una pàgina contínua pinta les seves seqüències una darrere l'altra", () => {
    const document = freeDocument();
    renderPages({
      ...document,
      pages: {
        sheets: [
          {
            id: "sh_1",
            mode: "auto",
            placements: [placement("pl_1", 1), placement("pl_2", 2)],
          },
        ],
        common: [],
      },
    });
    expect(
      screen.getByRole("button", { name: /^Sequence 2, 3 pictograms$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Sequence 3, 1 pictogram$/ }),
    ).toBeInTheDocument();
    // Sense plantilla: el botó de la capçalera no hi és
    expect(
      screen.queryByRole("button", { name: "Template" }),
    ).not.toBeInTheDocument();
  });

  it("una pàgina sense res ho diu i ofereix d'afegir-hi seqüències", () => {
    const document = freeDocument();
    renderPages({
      ...document,
      pages: {
        sheets: [{ id: "sh_1", mode: "template", placements: [] }],
        common: [],
      },
    });

    expect(screen.getByText("This page is empty")).toBeInTheDocument();
  });
});

/** Un botó que imprimeix passant per l'avís. */
const PrintButton = ({ onPrint }: { onPrint: () => void }) => {
  const { check, dialog } = useBeforePrintCheck();
  return (
    <>
      <button onClick={() => check("print", onPrint)}>Print</button>
      {dialog}
    </>
  );
};

describe("useBeforePrintCheck", () => {
  it("amb seqüències sense col·locar, avisa abans, i es pot imprimir igualment", async () => {
    const onPrint = vi.fn();
    renderWithProviders(<PrintButton onPrint={onPrint} />, {
      preloadedState: { document: freeDocument() },
    });

    await userEvent.click(screen.getByRole("button", { name: "Print" }));

    expect(onPrint).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "1 sequence is not on any page and will not be printed.",
    );

    await userEvent.click(screen.getByRole("button", { name: "Print anyway" }));

    expect(onPrint).toHaveBeenCalledTimes(1);
  });

  it("sense res a dir, imprimeix directament", async () => {
    const onPrint = vi.fn();
    const document = freeDocument();
    renderWithProviders(<PrintButton onPrint={onPrint} />, {
      preloadedState: {
        document: {
          ...document,
          content: { 0: sequenceFixture(2), 1: sequenceFixture(3) },
        },
      },
    });

    await userEvent.click(screen.getByRole("button", { name: "Print" }));

    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("rètols i previsualització de plantilles (R4, R9)", () => {
  const withLabel = (): DocumentSAAC => {
    const document = freeDocument();
    if (!document.pages) throw new Error("falten les pàgines");
    return {
      ...document,
      pages: {
        ...document.pages,
        sheets: [
          {
            ...document.pages.sheets[0],
            placements: [
              ...document.pages.sheets[0].placements,
              {
                kind: "text",
                id: "pl_t",
                text: "First\nthen",
                x: 5,
                y: 70,
                w: 100,
                h: 30,
              },
            ],
          },
          document.pages.sheets[1],
        ],
      },
    };
  };

  it("un rètol es pinta com a text de debò, i es pot seleccionar", async () => {
    renderPages(withLabel());
    const label = screen.getByRole("button", { name: "Label: First" });
    expect(label).toHaveTextContent("First");
    expect(label).toHaveTextContent("then");
    await userEvent.click(label);
    expect(label).toHaveAttribute("aria-pressed", "true");
  });

  /** Posa una plantilla a previsualitzar, com ho fa el selector de la columna. */
  const Preview = ({ sheetIndex }: { sheetIndex: number }) => {
    const { setTemplatePreview } = useViewSelection();
    useEffect(() => {
      const template = templateById("first-then");
      if (template) setTemplatePreview({ sheetIndex, template });
    }, [sheetIndex, setTemplatePreview]);
    return null;
  };

  it("la plantilla que es previsualitza es dibuixa només a la seva pàgina, sense moure res", () => {
    renderWithProviders(
      <ViewSelectionProvider>
        <Preview sheetIndex={1} />
        <FreeLayoutPages
          pageDimensions={{ width: 756, height: 1085 }}
          displayWidth={378}
          displayHeight={542}
          scale={0.5}
          author=""
        />
      </ViewSelectionProvider>,
      { preloadedState: { document: freeDocument() } },
    );
    const guides = screen.getAllByTestId("template-guides");
    expect(guides).toHaveLength(1);
    const sheets = document.querySelectorAll(".preview-content");
    expect(sheets[1]).toContainElement(guides[0]);
    // Quatre espais, dos dels quals de rètol
    expect(guides[0].children).toHaveLength(4);
    expect(guides[0]).toHaveTextContent("LabelLabel");
    // Els blocs no s'han mogut
    expect(
      screen.getAllByRole("button", { name: /^Sequence 2, 3 pictograms$/ }),
    ).toHaveLength(2);
  });
});

describe("el menú de la pàgina i els blocs buits", () => {
  const storyPage = (): DocumentSAAC => {
    const document = freeDocument();
    if (!document.pages) throw new Error("falten les pàgines");
    return {
      ...document,
      pages: {
        sheets: [
          {
            id: "sh_1",
            mode: "template",
            template: "story-page",
            placements: [{ ...placement("pl_1", 1), slot: 0 }],
          },
        ],
        common: [],
      },
    };
  };

  it("els espais lliures de la plantilla ofereixen un text o una seqüència", async () => {
    renderPages(storyPage());
    expect(screen.getByRole("group", { name: "Empty space 2" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Empty space 3" })).toBeVisible();

    const empty = screen.getByRole("group", { name: "Empty space 2" });
    await userEvent.click(
      within(empty).getByRole("button", { name: "Add text" }),
    );

    // El rètol nou ocupa l'espai i queda seleccionat
    expect(
      screen.queryByRole("group", { name: "Empty space 2" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Label: Empty label" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("el menú «⋯» té la disposició, afegir un bloc i les plantilles", async () => {
    renderPages(storyPage());
    await userEvent.click(
      screen.getByRole("button", { name: "More page actions" }),
    );
    const menu = screen.getByRole("menu");
    expect(
      within(menu).getByRole("menuitemradio", { name: "In blocks" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      within(menu).getByRole("menuitem", { name: "Text block" }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(menu).getByRole("menuitem", { name: "Template…" }),
    );
    const templates = screen.getByRole("dialog", {
      name: "Templates for page 1",
    });
    expect(
      within(templates).getByRole("button", { name: "Story page" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("moure un bloc amb el teclat (fase 4)", () => {
  it("seleccionat, les fletxes el mouen una cel·la; amb Maj, en canvien la mida", async () => {
    const document = freeDocument();
    if (!document.pages) throw new Error("falten les pàgines");
    const { store } = renderPages({
      ...document,
      pages: {
        sheets: [
          {
            id: "sh_1",
            mode: "template",
            placements: [{ ...placement("pl_1", 1), x: 0, y: 0, w: 40, h: 40 }],
          },
        ],
        common: [],
      },
    });
    const block = screen.getByRole("button", { name: /^Sequence 2,/ });
    const box = () => {
      const found = store.getState().document.pages?.sheets[0].placements[0];
      if (!found || found.kind === "unknown") throw new Error("no hi és");
      return found;
    };

    // Sense seleccionar, les fletxes no el mouen
    block.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(box().x).toBe(0);

    await userEvent.click(block);
    await userEvent.keyboard("{ArrowRight}");
    expect(box().x).toBeGreaterThan(0);
    // Al costat esquerre del full no hi ha espai entre blocs: la vora és el full
    const moved = box();

    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(box().y).toBeCloseTo(moved.y);
    expect(box().h).toBeGreaterThan(moved.h);
    // Seleccionat, es veu la quadrícula de punts
    expect(screen.getByTestId("grid-dots")).toBeInTheDocument();
  });
});
