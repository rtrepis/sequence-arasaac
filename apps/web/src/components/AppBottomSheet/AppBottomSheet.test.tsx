import { ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/renderWithProviders";
import {
  FLOATING_FLOOR_VARIABLE,
  FLOATING_INSET_VARIABLE,
  useFloatingRaised,
} from "@components/FloatingLayer";
import { AppBottomSheet, BottomSheetSnap } from "./index";

// Els textos els posa qui munta el panell; aquí, uns de prova
const LABELS = {
  label: "Settings",
  showLabel: "Show settings",
  hideLabel: "Hide settings",
  returnLabel: "Back to the sheet",
};

/** Qui escolta el senyal genèric, com hi escoltarà la barra de l'app. */
const RaisedProbe = (): ReactElement => (
  <span data-testid="raised">{String(useFloatingRaised())}</span>
);

/** El panell controlat des de fora, com el muntarà la vista. */
const Harness = ({
  initial = "collapsed",
  onSnapChange,
}: {
  initial?: BottomSheetSnap;
  onSnapChange?: (snap: BottomSheetSnap) => void;
}): ReactElement => {
  const [snap, setSnap] = useState<BottomSheetSnap>(initial);

  return (
    <>
      <RaisedProbe />
      <AppBottomSheet
        {...LABELS}
        snap={snap}
        onSnapChange={(next) => {
          onSnapChange?.(next);
          setSnap(next);
        }}
        header={<span>Document › Page 1</span>}
      >
        <button type="button">A setting</button>
      </AppBottomSheet>
    </>
  );
};

const rootVariable = (name: string): string =>
  document.documentElement.style.getPropertyValue(name);

describe("AppBottomSheet", () => {
  it("és una regió amb nom, no un diàleg", () => {
    renderWithProviders(<Harness />);

    expect(screen.getByRole("region", { name: "Settings" })).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("plegat, mostra la capçalera i amaga el contingut", async () => {
    renderWithProviders(<Harness />);

    expect(screen.getByText("Document › Page 1")).toBeVisible();
    const toggle = screen.getByRole("button", { name: "Show settings" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // El contingut plegat no es pot tabular ni llegir
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "A setting" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("el botó alterna plegat ↔ mig i diu què farà", async () => {
    const user = userEvent.setup();
    const onSnapChange = vi.fn();
    renderWithProviders(<Harness onSnapChange={onSnapChange} />);

    await user.click(screen.getByRole("button", { name: "Show settings" }));

    expect(onSnapChange).toHaveBeenLastCalledWith("half");
    const hide = screen.getByRole("button", { name: "Hide settings" });
    expect(hide).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region")).toHaveAttribute("data-snap", "half");
    expect(screen.getByRole("button", { name: "A setting" })).toBeVisible();

    await user.click(hide);

    expect(onSnapChange).toHaveBeenLastCalledWith("collapsed");
    expect(
      screen.getByRole("button", { name: "Show settings" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("cap botó no porta a sencer (M3)", async () => {
    const user = userEvent.setup();
    const onSnapChange = vi.fn();
    renderWithProviders(<Harness onSnapChange={onSnapChange} />);

    await user.click(screen.getByRole("button", { name: "Show settings" }));
    await user.click(screen.getByRole("button", { name: "Hide settings" }));
    await user.click(screen.getByRole("button", { name: "Show settings" }));

    expect(onSnapChange).not.toHaveBeenCalledWith("full");
  });

  it("a sencer, la franja de dalt és un botó que torna a mig", async () => {
    const user = userEvent.setup();
    const onSnapChange = vi.fn();
    renderWithProviders(<Harness initial="full" onSnapChange={onSnapChange} />);

    // Obert a sencer, el botó de la capçalera diu que amaga
    expect(
      screen.getByRole("button", { name: "Hide settings" }),
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Back to the sheet" }));

    expect(onSnapChange).toHaveBeenLastCalledWith("half");
    expect(
      screen.queryByRole("button", { name: "Back to the sheet" }),
    ).not.toBeInTheDocument();
  });

  it("amb el teclat: el botó és a l'ordre de tabulació i s'activa amb Enter i espai", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Show settings" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("region")).toHaveAttribute("data-snap", "half");

    // Obert, el contingut ve just després del botó
    await user.tab();
    expect(screen.getByRole("button", { name: "A setting" })).toHaveFocus();

    await user.tab({ shift: true });
    await user.keyboard(" ");
    expect(screen.getByRole("region")).toHaveAttribute(
      "data-snap",
      "collapsed",
    );
  });

  it("Escape no mou el panell: a la vista, Escape treu la selecció", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial="half" />);

    screen.getByRole("button", { name: "A setting" }).focus();
    await user.keyboard("{Escape}");

    expect(screen.getByRole("region")).toHaveAttribute("data-snap", "half");
  });

  it("no és modal: el que hi ha fora continua sent a l'abast", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <button type="button">On the sheet</button>
        <Harness initial="half" />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "On the sheet" }));
    expect(screen.getByRole("button", { name: "On the sheet" })).toHaveFocus();
  });

  it("declara la reserva i el terra amb la seva alçada, i els retira en desmuntar-se", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<Harness />);

    // jsdom: finestra de 768 px i capçalera sense alçada
    const half = Math.round(window.innerHeight / 2);

    await user.click(screen.getByRole("button", { name: "Show settings" }));

    expect(rootVariable(FLOATING_FLOOR_VARIABLE)).toBe(`${half}px`);
    expect(rootVariable(FLOATING_INSET_VARIABLE)).toBe(`${half}px`);

    unmount();

    expect(rootVariable(FLOATING_FLOOR_VARIABLE)).toBe("");
    expect(rootVariable(FLOATING_INSET_VARIABLE)).toBe("0px");
  });

  it("a sencer, el terra es queda a mig: els avisos no tapen la franja que torna", () => {
    const { unmount } = renderWithProviders(<Harness initial="full" />);

    // jsdom: finestra de 768 px i capçalera sense alçada
    const half = Math.round(window.innerHeight / 2);
    const full = window.innerHeight - 64;

    expect(rootVariable(FLOATING_FLOOR_VARIABLE)).toBe(`${half}px`);
    // La reserva, en canvi, és la de debò
    expect(rootVariable(FLOATING_INSET_VARIABLE)).toBe(`${full}px`);

    unmount();
  });

  it("avisa amb el senyal genèric quan és a mig o a sencer", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    expect(screen.getByTestId("raised")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "Show settings" }));
    expect(screen.getByTestId("raised")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "Hide settings" }));
    expect(screen.getByTestId("raised")).toHaveTextContent("false");
  });

  it("en desmuntar-se obert, retira el senyal", () => {
    const { unmount } = renderWithProviders(
      <>
        <RaisedProbe />
      </>,
    );
    const sheet = renderWithProviders(<Harness initial="half" />);

    expect(screen.getAllByTestId("raised")[0]).toHaveTextContent("true");

    sheet.unmount();
    expect(screen.getByTestId("raised")).toHaveTextContent("false");
    unmount();
  });
});
