import {
  fireEvent,
  preloadedState,
  render,
  screen,
} from "../../utils/test-utils";
import PictEdit from "./PictEdit";

const mockSequence = preloadedState.sequence[0];

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

describe("Give a component PictEdit", () => {
  const pictogram = {
    ...preloadedState.sequence[0],
    index: 0,
    number: 26527,
    border: {
      in: { color: "blue", radius: 20, size: 2 },
      out: { color: "green", radius: 20, size: 2 },
    },
    word: { ...mockSequence.word, keyWord: "Empty" },
  };
  describe("When it's rendered with pictogram", () => {
    test("Then should show button, and click open Modal", () => {
      const expectButton = `${pictogram.index + 1} Pictogram image ${
        pictogram.word.keyWord
      }`;

      render(<PictEdit pictogram={pictogram} />, {
        preloadedState: preloadedState,
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
    test("Then should show button Close, and click close Modal", () => {
      const expectButton = "Close";
      const openButton = `${pictogram.index + 1} Pictogram image ${
        pictogram.word.keyWord
      }`;

      render(<PictEdit pictogram={pictogram} />, {
        preloadedState: preloadedState,
      });

      const button = screen.getByRole("button", { name: openButton });
      fireEvent.click(button);

      const buttonClose = screen.getByRole("button", { name: expectButton });
      fireEvent.click(buttonClose);

      expect(buttonClose).toBeInTheDocument();
    });
  });

  describe("When user click delete", () => {
    test("Then should called dispatch subtrac and renumber", () => {
      const DeleteButton = "Delete";
      const openButton = `${pictogram.index + 1} Pictogram image ${
        pictogram.word.keyWord
      }`;
      const expectActions = [
        { payload: 0, type: "sequence/subtractPictogram" },
        { payload: undefined, type: "sequence/renumberSequence" },
      ];

      render(<PictEdit pictogram={pictogram} />, {
        preloadedState: preloadedState,
      });

      const buttonOpen = screen.getByRole("button", { name: openButton });
      fireEvent.click(buttonOpen);

      const button = screen.getByRole("button", { name: DeleteButton });
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledWith(expectActions[0]);
      expect(mockDispatch).toHaveBeenCalledWith(expectActions[1]);
    });
  });
});
