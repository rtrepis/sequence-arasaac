import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/renderWithProviders";
import SettingCardBoolean from "./SettingCardBoolean";

describe("SettingCardBoolean", () => {
  it("hauria de donar al switch el nom del títol de la fila", () => {
    renderWithProviders(
      <SettingCardBoolean setting="numbered" state={false} setState={vi.fn()} />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Numbered" }),
    ).toBeInTheDocument();
  });

  it("no hauria de barrejar els noms de dos ajustos a la mateixa pàgina", () => {
    renderWithProviders(
      <>
        <SettingCardBoolean setting="numbered" state setState={vi.fn()} />
        <SettingCardBoolean setting="color" state setState={vi.fn()} />
      </>,
    );

    expect(screen.getByRole("checkbox", { name: "Numbered" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Color" })).toBeChecked();
  });
});
