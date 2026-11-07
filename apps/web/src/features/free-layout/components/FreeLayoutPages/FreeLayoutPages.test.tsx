import { describe, expect, it, vi } from "vitest";
import React from "react";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import { sequenceFixture } from "@/test/fixtures/document";
import type { DocumentSAAC } from "@/types/document";
import { useBeforePrintCheck } from "@features/free-layout/hooks/useBeforePrintCheck";
import FreeLayoutPages from "./FreeLayoutPages";

// Les pàgines del mode lliure (ADR-005): cada pàgina és un full que
// s'imprimeix, amb les seves caixes i les comunes; i l'avís abans d'imprimir.

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
    <FreeLayoutPages
      pageDimensions={{ width: 756, height: 1085 }}
      displayWidth={378}
      displayHeight={542}
      scale={0.5}
      author=""
    />,
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

  it("la caixa obre el seu menú, i «A totes les pàgines» hi diu com és", async () => {
    renderPages();

    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sequence 1,/ })[0],
    );

    expect(
      screen.getByRole("menuitemcheckbox", { name: "On every page" }),
    ).toHaveAttribute("aria-checked", "true");
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
