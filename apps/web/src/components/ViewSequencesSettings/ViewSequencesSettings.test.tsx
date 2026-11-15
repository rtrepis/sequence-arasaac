import { afterEach, describe, expect, it } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
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

  it("al mòbil no hi ha cap dels dos botons, i els ajustos són al panell de baix", async () => {
    setWindowSize(412, 915);
    renderView();
    expect(
      screen.queryByRole("button", { name: "Hide view settings" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Fit to width" }),
    ).not.toBeInTheDocument();
    // El panell, plegat: només les molles i el botó (M1)
    const panel = screen.getByRole("region", { name: "Settings" });
    expect(panel).toHaveAttribute("data-snap", "collapsed");
    const show = screen.getByRole("button", { name: "Show settings" });
    expect(show).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(show);

    expect(panel).toHaveAttribute("data-snap", "half");
    expect(document.getElementById("view-settings-column")).toBeVisible();
  });
});

// La vista al mòbil (fase 4 de `docs/PLA-vista-mobil.md`)
describe("la vista al mòbil", () => {
  it("a sobre del full només hi ha les sortides; girar el full és al nivell «Document»", async () => {
    setWindowSize(412, 915);
    renderView();
    expect(screen.getByRole("button", { name: "Print" })).toBeInTheDocument();
    // Girar el full ja no és un botó de la fila (M4)
    expect(
      screen.queryByRole("button", { name: "Page orientation" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Show settings" }),
    );

    expect(
      screen.getByRole("button", { name: "Portrait page" }),
    ).toBeInTheDocument();
  });

  it("tocar el full fora de les seqüències porta el panell a mig, amb el nivell «Pàgina» obert", async () => {
    setWindowSize(412, 915);
    renderView();
    const panel = screen.getByRole("region", { name: "Settings" });

    await userEvent.click(screen.getByTestId("view-sheet-area"));

    expect(panel).toHaveAttribute("data-snap", "half");
    // Document, plegat; Pàgina, obert (D2)
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("button", { name: /^Document|^Page/ })
          .filter((button) => button.hasAttribute("aria-expanded"))
          .map((button) => button.getAttribute("aria-expanded")),
      ).toEqual(["false", "true"]),
    );
  });

  it("a l'escriptori no hi ha panell de baix", () => {
    setWindowSize(1366, 768);
    renderView();
    expect(
      screen.queryByRole("region", { name: "Settings" }),
    ).not.toBeInTheDocument();
  });
});
