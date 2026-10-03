import { describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/renderWithProviders";
import { createAppStore } from "@app/store";
import { updateSettingsActiveTabActionCreator } from "@features/user-settings/store/uiSlice";
import SettingsDialog from "./SettingsDialog";

const TAB_NAMES = ["User", "Document style", "View", "Personal vocabulary"];

describe("SettingsDialog", () => {
  it("hauria de pintar un tab per cada àrea de configuració", () => {
    renderWithProviders(<SettingsDialog open onClose={vi.fn()} />);

    TAB_NAMES.forEach((name) =>
      expect(screen.getByRole("tab", { name })).toBeInTheDocument(),
    );
  });

  it("hauria de començar pel tab que diu l'estat de la interfície", () => {
    const store = createAppStore();
    store.dispatch(updateSettingsActiveTabActionCreator("view"));

    renderWithProviders(<SettingsDialog open onClose={vi.fn()} />, {
      store,
    });

    expect(screen.getByRole("tab", { name: "View" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("hauria de recordar a la interfície el tab que s'ha triat", async () => {
    const store = createAppStore();
    renderWithProviders(<SettingsDialog open onClose={vi.fn()} />, {
      store,
    });

    await userEvent.click(screen.getByRole("tab", { name: "View" }));

    expect(store.getState().ui.settingsActiveTab).toBe("view");
    expect(screen.getByRole("tab", { name: "View" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("hauria de tancar-se amb la creu de la barra", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SettingsDialog open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "close" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("hauria d'avisar l'estat que la configuració és oberta, perquè el snackbar d'estil hi vagi a dins", async () => {
    const store = createAppStore();
    const { unmount } = renderWithProviders(
      <SettingsDialog open onClose={vi.fn()} />,
      { store },
    );

    await waitFor(() =>
      expect(store.getState().style.settingsDialogOpen).toBe(true),
    );

    unmount();
    expect(store.getState().style.settingsDialogOpen).toBe(false);
  });

  it("hauria de tenir nom accessible, que és el que anuncia el lector de pantalla", () => {
    renderWithProviders(<SettingsDialog open onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
  });
});
