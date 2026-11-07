import { afterEach, describe, expect, it } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import ViewSequencesSettings from "./ViewSquenceSettings";

// L'espai del full a la pàgina de vista (`docs/PLA-mode-lliure.md`, §6,
// «L'espai»): a partir d'escriptori, la columna d'ajustos es pot amagar i el
// full es pot ajustar a l'amplada. Al mòbil no hi ha cap dels dos botons.

/** La mida de la finestra que llegeix `useWindowResize`. */
const setWindowSize = (width: number, height: number) => {
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    value: height,
  });
};

const renderView = () =>
  renderWithProviders(
    <ViewSequencesSettings>{() => <></>}</ViewSequencesSettings>,
  );

/** L'amplada a què es pinta el full a la pantalla. */
const previewWidth = (container: HTMLElement): string =>
  getComputedStyle(container.querySelector(".preview-container") as HTMLElement)
    .width;

afterEach(() => setWindowSize(0, 0));

describe("l'espai del full a la vista", () => {
  it("la columna d'ajustos s'amaga i torna, i el botó diu com és", async () => {
    setWindowSize(1366, 768);
    renderView();
    const column = document.getElementById("view-settings-column");
    const hide = screen.getByRole("button", { name: "Hide view settings" });
    expect(hide).toHaveAttribute("aria-expanded", "true");
    expect(hide).toHaveAttribute("aria-controls", "view-settings-column");
    expect(column).toBeVisible();

    await userEvent.click(hide);

    expect(column).not.toBeVisible();
    const show = screen.getByRole("button", { name: "Show view settings" });
    expect(show).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(show);

    expect(column).toBeVisible();
  });

  it("ajustar a l'amplada fa el full més gran, i es pot tornar al full sencer", async () => {
    setWindowSize(1366, 768);
    const { container } = renderView();
    const before = parseFloat(previewWidth(container));

    await userEvent.click(screen.getByRole("button", { name: "Fit to width" }));

    expect(parseFloat(previewWidth(container))).toBeGreaterThan(before);

    await userEvent.click(
      screen.getByRole("button", { name: "Show the whole page" }),
    );

    expect(parseFloat(previewWidth(container))).toBeCloseTo(before);
  });

  it("al mòbil no hi ha cap dels dos botons, i la columna hi és sempre", () => {
    setWindowSize(412, 915);
    renderView();
    expect(
      screen.queryByRole("button", { name: "Hide view settings" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Fit to width" }),
    ).not.toBeInTheDocument();
    expect(document.getElementById("view-settings-column")).toBeVisible();
  });
});
