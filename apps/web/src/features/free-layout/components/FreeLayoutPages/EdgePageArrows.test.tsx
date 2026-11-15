import { ReactElement, useState } from "react";
import { describe, expect, it } from "vitest";
import {
  fireEvent,
  renderWithProviders,
  screen,
  userEvent,
} from "@/test/renderWithProviders";
import EdgePageArrows from "./EdgePageArrows";

/** Tres pàgines, amb les fletxes de la vora com les munta `FreeLayoutPages`. */
const Pages = ({ initial = 0 }: { initial?: number }): ReactElement => {
  const [page, setPage] = useState(initial);
  const count = 3;

  return (
    <>
      <span data-testid="page">{page + 1}</span>
      <EdgePageArrows
        hasPrevious={page > 0}
        hasNext={page < count - 1}
        shown={{ previous: false, next: false }}
        onPrevious={() => setPage((current) => current - 1)}
        onNext={() => setPage((current) => current + 1)}
      />
      <button type="button">Fora</button>
    </>
  );
};

describe("EdgePageArrows", () => {
  it("sense pàgina en una direcció, aquella fletxa no hi és", () => {
    renderWithProviders(<Pages />);

    expect(
      screen.queryByRole("button", { name: "Previous page" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next page" }),
    ).toBeInTheDocument();
  });

  it("amb el teclat, en arribar a l'última pàgina el focus passa a l'altra fletxa", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Pages />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Next page" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByTestId("page")).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveFocus();

    // L'última: la fletxa «següent» desapareix, i el focus no es perd
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("page")).toHaveTextContent("3");
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveFocus();

    // I igual tornant enrere fins a la primera
    await user.keyboard("{Enter}{Enter}");
    expect(screen.getByTestId("page")).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveFocus();
  });

  it("si el focus és en un altre lloc, no l'hi pren", () => {
    renderWithProviders(<Pages initial={1} />);

    const outside = screen.getByRole("button", { name: "Fora" });
    outside.focus();
    // Un toc a la fletxa sense que en tingui el focus (el dit, a Safari)
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByTestId("page")).toHaveTextContent("3");
    expect(outside).toHaveFocus();
  });
});
