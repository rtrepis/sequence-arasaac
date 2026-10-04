import { describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/renderWithProviders";
import TextOverflowWarning from "./TextOverflowWarning";

const renderWarning = (
  props: Partial<React.ComponentProps<typeof TextOverflowWarning>> = {},
) => {
  const handlers = {
    onFitPictogram: vi.fn(),
    onFitDocument: vi.fn(),
    onEditText: vi.fn(),
  };
  renderWithProviders(
    <TextOverflowWarning
      number={3}
      fittingSize={0.8}
      canFitDocument
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

const openOptions = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: "Pictogram 3: the text doesn't fit" }),
  );
  return screen.findByRole("dialog", { name: "The text doesn't fit" });
};

describe("TextOverflowWarning", () => {
  it("obre les opcions amb la mida a què quedaria la lletra", async () => {
    renderWarning();
    await openOptions();

    expect(
      screen.getByRole("button", {
        name: "Reduce the font size of the whole document to 0.8",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Reduce the font size of this pictogram only to 0.8",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit the text" }),
    ).toBeInTheDocument();
  });

  it("reduir la del document la demana amb la mida, i tanca les opcions", async () => {
    const { onFitDocument } = renderWarning();
    await openOptions();

    await userEvent.click(
      screen.getByRole("button", { name: /whole document/ }),
    );

    expect(onFitDocument).toHaveBeenCalledWith(0.8);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("no ofereix la del document si el pictograma té mida pròpia", async () => {
    renderWarning({ canFitDocument: false });
    await openOptions();

    expect(
      screen.queryByRole("button", { name: /whole document/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /this pictogram only/ }),
    ).toBeInTheDocument();
  });

  it("si no hi cap ni amb la lletra mínima, només deixa editar el text", async () => {
    const { onEditText } = renderWarning({ fittingSize: null });
    await openOptions();

    expect(
      screen.getByText(/the text needs to be shorter/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Reduce/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Edit the text" }),
    );
    // L'editor surt quan el quadre ja s'ha tancat
    await waitFor(() => expect(onEditText).toHaveBeenCalled());
  });
});
