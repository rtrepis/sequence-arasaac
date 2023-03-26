import { fireEvent, render, screen } from "../../utils/test-utils";
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
            img: {
              searched: { bestIdPicts: [0], word: "Hello" },
              selectedId: 0,
              settings: { skin: "default" },
            },
            indexSequence: 0,
            settings: {},
          },
          type: "sequence/addPictogram",
        },
        {
          payload: {
            img: {
              searched: { bestIdPicts: [0], word: "word" },
              selectedId: 0,
              settings: { skin: "default" },
            },
            indexSequence: 1,
            settings: {},
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
});
