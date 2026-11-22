// L'interruptor de la pantalla d'edició a l'escriptori (pla dels estils, pas
// 10; D26 i Q4): es passa a la nova i es torna a la d'abans, i la tria es
// recorda en aquest navegador. (jsdom no és un mòbil: és l'escriptori.)
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import EditSequencesPage from "./EditSequencesPage";

// Les paraules clau d'ARASAAC no fan res aquí, i sense xarxa la crida falla
vi.mock("@features/pictogram/hooks/useArasaacKeywords", () => ({
  default: () => undefined,
}));

afterEach(() => localStorage.removeItem("editLayout"));

describe("EditSequencesPage a l'escriptori", () => {
  it("passa a l'edició nova i en torna, i ho recorda", async () => {
    const { unmount } = renderWithProviders(<EditSequencesPage />);
    // La d'abans, amb les pestanyes
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-bottom-bar")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Try the new editor" }),
    );
    // La nova: sense pestanyes, amb la capçalera i la barra de baix
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByTestId("edit-bottom-bar")).toBeInTheDocument();
    expect(localStorage.getItem("editLayout")).toBe("new");

    // Es recorda en tornar a obrir l'edició
    unmount();
    renderWithProviders(<EditSequencesPage />);
    expect(screen.getByTestId("edit-bottom-bar")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Back to the previous editor" }),
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(localStorage.getItem("editLayout")).toBe("classic");
  });
});
