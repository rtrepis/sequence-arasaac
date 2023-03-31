import { PictSequence } from "../../types/sequence";
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
  const mockPict: PictSequence = {
    ...preloadedState.sequence[0],
    indexSequence: 0,
    img: {
      ...mockSequence.img,
      selectedId: 26527,
      searched: { ...mockSequence.img.searched, word: "Empty" },
    },
    settings: {
      ...preloadedState.sequence[0].settings,
      border: {
        in: { color: "blue", radius: 20, size: 2 },
        out: { color: "green", radius: 20, size: 2 },
      },
    },
  };
  describe("When it's rendered with pictogram", () => {
    test("Then should show button, and click open Modal", () => {
      const expectButton = `${mockPict.indexSequence + 1} Pictogram image ${
        mockPict.img.searched.word
      }`;

      render(<PictEdit pictogram={mockPict} />, {
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
      const openButton = `${mockPict.indexSequence + 1} Pictogram image ${
        mockPict.img.searched.word
      }`;

      render(<PictEdit pictogram={mockPict} />, {
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
      const openButton = `${mockPict.indexSequence + 1} Pictogram image ${
        mockPict.img.searched.word
      }`;
      const expectActions = [
        { payload: 0, type: "sequence/subtractPictogram" },
        { payload: undefined, type: "sequence/renumberSequence" },
      ];

      render(<PictEdit pictogram={mockPict} />, {
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
