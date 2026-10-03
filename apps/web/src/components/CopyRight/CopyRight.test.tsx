import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/renderWithProviders";
import CopyRight, { PRINT_COPYRIGHT_CLASS } from "./CopyRight";

const licenceText = /ARASAAC/;

describe("CopyRight", () => {
  it("hauria de dir l'autoria i la llicència dels pictogrames, que ARASAAC demana", () => {
    renderWithProviders(<CopyRight author="" />);

    expect(screen.getByText(licenceText)).toBeInTheDocument();
  });

  it("hauria d'afegir l'autor de la seqüència quan n'hi ha", () => {
    renderWithProviders(<CopyRight author="Ramon" />);

    expect(screen.getByText(/Ramon/)).toBeInTheDocument();
  });

  it("hauria de sortir també a la pantalla: el full ha d'ensenyar el que s'imprimirà", () => {
    renderWithProviders(<CopyRight author="" />);

    // Mentre només sortia al paper, la previsualització oferia una franja
    // d'alçada que el full no tenia, i el que hi arribava es trepitjava amb el
    // peu en imprimir (C23)
    expect(getComputedStyle(screen.getByText(licenceText)).display).toBe(
      "block",
    );
  });

  it("hauria de portar tinta de paper, que sobre el full no hi mana el tema", () => {
    renderWithProviders(<CopyRight author="" />);

    // En tema fosc, el text del tema és blanc: damunt del paper no es veuria
    expect(getComputedStyle(screen.getByText(licenceText)).color).toBe(
      "rgb(0, 0, 0)",
    );
  });

  it("no hauria d'estar tret del flux: és el que el feia caure damunt dels pictogrames", () => {
    renderWithProviders(<CopyRight author="" />);

    // Amb `position: fixed` no ocupava lloc, i amb el full ocupant la pàgina
    // sencera el peu i l'última fila de pictogrames compartien els mateixos
    // píxels. Dins del flux, el full li reserva l'espai sol (C23 del backlog)
    const position = getComputedStyle(screen.getByText(licenceText)).position;
    expect(position).not.toBe("fixed");
    expect(position).not.toBe("absolute");
  });

  it("hauria de portar la classe estable que el PDF necessita per trobar-lo", () => {
    renderWithProviders(<CopyRight author="" />);

    // html2canvas captura en `media: screen`, on la regla d'impressió no
    // existeix: `useDownloadPdf` el fa visible al clon per aquesta classe, que
    // no pot dependre de les que genera emotion
    expect(screen.getByText(licenceText)).toHaveClass(PRINT_COPYRIGHT_CLASS);
  });
});
