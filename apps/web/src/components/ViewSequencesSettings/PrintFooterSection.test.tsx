import { describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import PrintFooterSection from "./PrintFooterSection";

const renderSection = (
  props: Partial<React.ComponentProps<typeof PrintFooterSection>> = {},
) => {
  const onLicenceChange = vi.fn();
  renderWithProviders(
    <PrintFooterSection
      author=""
      onAuthorChange={vi.fn()}
      licence={undefined}
      onLicenceChange={onLicenceChange}
      {...props}
    />,
  );
  return { onLicenceChange, licence: screen.getByRole("checkbox") };
};

describe("PrintFooterSection", () => {
  it("hauria de portar la llicència encesa quan no se n'ha dit res", () => {
    const { licence } = renderSection();

    expect(licence).toBeChecked();
  });

  it("hauria de deixar treure la llicència quan no hi ha autor", async () => {
    const { licence, onLicenceChange } = renderSection();

    await userEvent.click(licence);

    expect(onLicenceChange).toHaveBeenCalledWith(false);
  });

  it("hauria de deixar tornar-la a posar", async () => {
    const { licence, onLicenceChange } = renderSection({ licence: false });

    await userEvent.click(licence);

    expect(onLicenceChange).toHaveBeenCalledWith(true);
  });

  it("hauria de mantenir-la encesa quan hi ha autor", () => {
    const { licence } = renderSection({ author: "Ramon", licence: false });

    expect(licence).toBeChecked();
  });

  it("no hauria de deixar treure-la quan hi ha autor", async () => {
    const { licence, onLicenceChange } = renderSection({ author: "Ramon" });

    await userEvent.click(licence);

    // Qui signa la seqüència ha de dir també d'on són els pictogrames
    expect(onLicenceChange).not.toHaveBeenCalled();
    expect(licence).toHaveAttribute("aria-disabled", "true");
  });

  it("hauria de seguir sent accessible amb el teclat tot i no poder-se tocar", () => {
    const { licence } = renderSection({ author: "Ramon" });

    // `aria-disabled` i no `disabled`: així no surt de l'ordre de tabulació i
    // qui hi arriba amb teclat pot llegir per què no respon
    expect(licence).not.toBeDisabled();
  });

  it("hauria de dir per què no es pot treure sense haver de passar-hi el ratolí", () => {
    renderSection({ author: "Ramon" });

    // En tauleta no hi ha hover: el motiu ha de ser a la vista des del principi,
    // no amagat en un tooltip que només surt amb el ratolí a sobre
    expect(screen.getByText(/pictograms are not yours/i)).toBeVisible();
  });

  it("hauria d'associar el motiu a l'interruptor per al lector de pantalla", () => {
    const { licence } = renderSection({ author: "Ramon" });

    expect(licence).toHaveAccessibleDescription(/pictograms are not yours/i);
  });

  it("no hauria de mostrar el motiu quan no hi ha autor", () => {
    renderSection();

    expect(screen.queryByText(/pictograms are not yours/i)).not.toBeInTheDocument();
  });
});
