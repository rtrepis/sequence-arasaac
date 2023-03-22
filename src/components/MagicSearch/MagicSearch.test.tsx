import userEvent from "@testing-library/user-event";
import {
  act,
  fireEvent,
  preloadedState,
  render,
  screen,
} from "../../utils/test-utils";
import MagicSearch from "./MagicSearch";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

const mockAction = jest.fn();
jest.mock("../../hooks/useAraSaac", () => () => ({
  getSearchPictogram: mockAction,
}));

describe("Give a component MagicSearch", () => {
  describe("When user typing 'Hello word'", () => {
    test("Then should called dispatch every each word", () => {
      const expectInput = "Magic Search";
      const expectButton = "To search";
      const userTyped = "Hello word";

      const expectActions = [
        {
          payload: {
            index: 0,
            number: 0,
            word: { keyWord: "Hello", pictograms: [0] },
          },
          type: "sequence/addPictogram",
        },
        {
          payload: {
            index: 1,
            number: 0,
            word: { keyWord: "word", pictograms: [0] },
          },
          type: "sequence/addPictogram",
        },
      ];

      render(<MagicSearch />);
      const input = screen.getByRole("textbox", { name: expectInput });
      const button = screen.getByRole("button", { name: expectButton });

      fireEvent.change(input, { target: { value: userTyped } });
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledWith(expectActions[0]);
      expect(mockDispatch).toHaveBeenCalledWith(expectActions[1]);
    });
  });

  describe("When user change one word", () => {
    test("Then should called one action", () => {
      const expectInput = "Magic Search";
      const expectButton = "To search";
      const stateMock = {
        ...preloadedState,
        sequence: [
          { index: 0, number: 0, word: { keyWord: "hello", pictograms: [0] } },
          { index: 1, number: 0, word: { keyWord: "word", pictograms: [0] } },
        ],
      };
      const userTyped = "hello people";

      const expectAction = ["people", 1, true];

      render(<MagicSearch />, { preloadedState: stateMock });
      const input = screen.getByRole("textbox", { name: expectInput });
      const button = screen.getByRole("button", { name: expectButton });

      fireEvent.change(input, { target: { value: userTyped } });
      fireEvent.click(button);

      expect(mockAction).toHaveBeenCalledWith(
        expectAction[0],
        expectAction[1],
        expectAction[2]
      );
    });
  });

  describe("When user erase one world", () => {
    test("Then should called action subtract", () => {
      const expectInput = "Magic Search";
      const expectButton = "To search";
      const userTyped = "hello ";
      const stateMock = {
        ...preloadedState,
        sequence: [
          { index: 0, number: 0, word: { keyWord: "hello", pictograms: [0] } },
          { index: 1, number: 0, word: { keyWord: "world", pictograms: [0] } },
        ],
      };

      const expectAction = {
        payload: undefined,
        type: "sequence/subtractPictogram",
      };

      render(<MagicSearch />, { preloadedState: stateMock });
      const input = screen.getByRole("textbox", { name: expectInput });
      const button = screen.getByRole("button", { name: expectButton });

      fireEvent.change(input, { target: { value: userTyped } });
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When user erase all word", () => {
    test("Then should called action subtract", async () => {
      const expectInput = "Magic Search";
      const userTyped = "a";
      const stateMock = {
        ...preloadedState,
        sequence: [
          {
            index: 0,
            number: 0,
            word: { keyWord: "hello", pictograms: [0] },
          },
          {
            index: 1,
            number: 0,
            word: { keyWord: "world", pictograms: [0] },
          },
        ],
      };

      const expectAction = { payload: [], type: "sequence/addPhrase" };

      render(<MagicSearch />, { preloadedState: stateMock });
      const input = screen.getByRole("textbox", { name: expectInput });

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        await userEvent.type(input, userTyped);
        await userEvent.type(input, "{backspace}");
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });
});
