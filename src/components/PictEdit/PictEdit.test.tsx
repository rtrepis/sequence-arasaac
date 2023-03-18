import { fireEvent, render, screen } from "../../utils/test-utils";
import PictEdit from "./PictEdit";

let preloadedStateMock = {
  sequence: [
    {
      index: 0,
      number: 26527,
      border: {
        in: { color: "blue", radius: 20, size: 2 },
        out: { color: "green", radius: 20, size: 2 },
      },
      word: { keyWord: "Empty" },
    },
  ],
  ui: {
    setting: { skin: "default" },
  },
};

describe("Give a component PictEdit", () => {
  const pictogram = {
    index: 0,
    number: 26527,
    border: {
      in: { color: "blue", radius: 20, size: 2 },
      out: { color: "green", radius: 20, size: 2 },
    },
    word: { keyWord: "Empty" },
  };
  describe("When it's rendered with pictogram", () => {
    test("Then should show button, and click open Modal", () => {
      const expectButton = `${pictogram.index + 1} Pictogram image ${
        pictogram.word.keyWord
      }`;

      render(<PictEdit pictogram={pictogram} />, {
        preloadedState: preloadedStateMock,
      });

      const button = screen.getByRole("button", { name: expectButton });

      fireEvent.click(button);

      let modal = screen.getByRole("heading", {
        name: "Edit Pictogram",
      });

      expect(modal).toBeInTheDocument();
    });
  });

  describe("When it's open modal user cant close", () => {
    jest.useFakeTimers();
    test("Then should show button Close, and click close Modal", () => {
      const expectButton = "Close";
      const openButton = `${pictogram.index + 1} Pictogram image ${
        pictogram.word.keyWord
      }`;

      render(<PictEdit pictogram={pictogram} />, {
        preloadedState: preloadedStateMock,
      });

      const button = screen.getByRole("button", { name: openButton });
      fireEvent.click(button);

      const buttonClose = screen.getByRole("button", { name: expectButton });
      fireEvent.click(buttonClose);

      expect(buttonClose).toBeInTheDocument();
    });
  });
});
