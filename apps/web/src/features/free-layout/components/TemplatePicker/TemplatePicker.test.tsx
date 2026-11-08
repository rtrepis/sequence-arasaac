import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, fireEvent } from "@testing-library/react";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import { SHAPED_TEMPLATES } from "@features/free-layout/model/templates";
import TemplatePicker, { LONG_PRESS_MS } from "./TemplatePicker";

// El selector de plantilles amb miniatures (R4): aplicar amb el clic, veure-la
// a la pàgina en passar-hi per damunt, amb el teclat o mantenint-la premuda.

const renderPicker = (value?: string) => {
  const onApply = vi.fn();
  const onPreview = vi.fn();
  renderWithProviders(
    <>
      <span id="tpl-label">Template</span>
      <TemplatePicker
        templates={SHAPED_TEMPLATES}
        value={value}
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

  it("el clic l'aplica; la que ja té la pàgina, marcada, es torna a aplicar (treu els retocs)", async () => {
    const { onApply } = renderPicker("week");
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ id: "menu" }),
    );
    const week = screen.getByRole("button", { name: "Week" });
    expect(week).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(week);
    expect(onApply).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "week" }),
    );
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

  it("cap plantilla no està apagada: totes es poden veure i triar", async () => {
    const { onApply, onPreview } = renderPicker();
    screen
      .getAllByRole("button")
      .forEach((button) => expect(button).not.toHaveAttribute("aria-disabled"));
    const firstThen = screen.getByRole("button", { name: "First / Then" });
    await userEvent.hover(firstThen);
    expect(onPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "first-then" }),
    );
    await userEvent.click(firstThen);
    expect(onApply).toHaveBeenCalledWith(
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
