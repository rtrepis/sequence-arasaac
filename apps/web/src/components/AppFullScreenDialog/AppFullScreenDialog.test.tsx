import { describe, expect, it, vi } from "vitest";
import { MdGridView } from "react-icons/md";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import AppFullScreenDialog, {
  AppFullScreenDialogTab,
} from "./AppFullScreenDialog";

type Tab = "first" | "second";

const TABS: AppFullScreenDialogTab<Tab>[] = [
  { value: "first", icon: <MdGridView />, label: "Primer" },
  { value: "second", icon: <MdGridView />, label: "Segon" },
];

const renderDialog = (props: Partial<Parameters<typeof AppFullScreenDialog<Tab>>[0]> = {}) =>
  renderWithProviders(
    <AppFullScreenDialog<Tab>
      open
      onClose={vi.fn()}
      title="Configuració"
      closeLabel="Tanca"
      {...props}
    >
      <p>contingut</p>
    </AppFullScreenDialog>,
  );

describe("AppFullScreenDialog", () => {
  it("hauria de tenir el títol com a nom accessible del diàleg", () => {
    renderDialog();

    expect(
      screen.getByRole("dialog", { name: "Configuració" }),
    ).toBeInTheDocument();
  });

  it("hauria de pintar el contingut que se li passa", () => {
    renderDialog();

    expect(screen.getByText("contingut")).toBeInTheDocument();
  });

  it("hauria de tancar-se amb la creu de la barra", async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "Tanca" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("hauria de pintar els tabs i marcar-ne l'actiu", () => {
    renderDialog({ tabs: TABS, activeTab: "second" });

    expect(screen.getByRole("tab", { name: "Primer" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Segon" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("hauria d'avisar de quin tab s'ha triat", async () => {
    const onTabChange = vi.fn();
    renderDialog({ tabs: TABS, activeTab: "first", onTabChange });

    await userEvent.click(screen.getByRole("tab", { name: "Segon" }));

    expect(onTabChange).toHaveBeenCalledWith("second");
  });

  it("no hauria de pintar cap barra de tabs si no n'hi ha", () => {
    renderDialog();

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("no hauria de pintar res mentre està tancat", () => {
    renderDialog({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
