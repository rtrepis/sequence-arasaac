import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, fireEvent } from "@testing-library/react";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import type { SequencePlacement } from "@/types/document";
import { SHAPED_TEMPLATES } from "@features/free-layout/model/templates";
import TemplatePicker, { LONG_PRESS_MS } from "./TemplatePicker";

// El selector de plantilles amb miniatures (R4): aplicar amb el clic, veure-la
// a la pàgina en passar-hi per damunt, amb el teclat o mantenint-la premuda.

const sequence = (id: string): SequencePlacement => ({
  kind: "sequence",
  id,
  sequenceKey: 0,
  x: 0,
  y: 0,
  w: 10,
  h: 10,
  columns: "auto",
});

const renderPicker = (count = 1, value?: string) => {
  const onApply = vi.fn();
  const onPreview = vi.fn();
  renderWithProviders(
    <>
      <span id="tpl-label">Template</span>
      <TemplatePicker
        templates={SHAPED_TEMPLATES}
        value={value}
        placements={Array.from({ length: count }, (_, i) => sequence(`s${i}`))}
        landscape={false}
        labelId="tpl-label"
        onApply={onApply}
        onPreview={onPreview}
      />
    </>,
  );
  return { onApply, onPreview };
};

afterEach(() => vi.useRealTimers());

describe("TemplatePicker", () => {
  it("un botó per plantilla, amb el nom, dins d'un grup amb el títol de la fila", () => {
    renderPicker();
    const group = screen.getByRole("group", { name: "Template" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(SHAPED_TEMPLATES.length);
    expect(
      screen.getByRole("button", { name: "First / Then" }),
    ).toBeInTheDocument();
  });

  it("el clic l'aplica; la que ja té la pàgina, marcada i sense efecte", async () => {
    const { onApply } = renderPicker(1, "week");
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ id: "menu" }),
    );
    const week = screen.getByRole("button", { name: "Week" });
    expect(week).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(week);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("passar-hi per damunt o anar-hi amb el teclat l'ensenya a la pàgina", async () => {
    const { onPreview } = renderPicker();
    await userEvent.hover(screen.getByRole("button", { name: "Week" }));
    expect(onPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "week" }),
    );
    await userEvent.unhover(screen.getByRole("button", { name: "Week" }));
    await userEvent.tab();
    expect(onPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: SHAPED_TEMPLATES[0].id }),
    );
  });

  it("on no caben les seqüències, no es pot triar ni s'ensenya", async () => {
    // Tres seqüències: «Primer / Després» només en té dos espais
    const { onApply, onPreview } = renderPicker(3);
    const firstThen = screen.getByRole("button", { name: "First / Then" });
    expect(firstThen).toHaveAttribute("aria-disabled", "true");
    await userEvent.hover(firstThen);
    await userEvent.click(firstThen);
    expect(onApply).not.toHaveBeenCalled();
    expect(onPreview).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: "first-then" }),
    );
  });

  it("al tàctil, mantenir-la premuda l'ensenya i en deixar-la no s'aplica", () => {
    vi.useFakeTimers();
    const { onApply, onPreview } = renderPicker();
    const menu = screen.getByRole("button", { name: "Menu" });
    fireEvent.pointerDown(menu, { pointerType: "touch" });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(onPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "menu" }),
    );
    fireEvent.pointerUp(menu, { pointerType: "touch" });
    fireEvent.click(menu);
    expect(onPreview).toHaveBeenLastCalledWith(null);
    expect(onApply).not.toHaveBeenCalled();
  });

  it("al tàctil, un toc curt l'aplica", () => {
    vi.useFakeTimers();
    const { onApply } = renderPicker();
    const menu = screen.getByRole("button", { name: "Menu" });
    fireEvent.pointerDown(menu, { pointerType: "touch" });
    fireEvent.pointerUp(menu, { pointerType: "touch" });
    fireEvent.click(menu);
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ id: "menu" }),
    );
  });
});
