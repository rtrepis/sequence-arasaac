import { fireEvent, render, screen } from "../../utils/test-utils";
import MagicSearch from "./MagicSearch";

const mockAction = jest.fn();
jest.mock("../../hooks/useAraSaac", () => () => ({
  getSearchPictogram: mockAction,
}));

describe("Give a component MagicSearch", () => {
  describe("When user typing 'Hello word'", () => {
    test("Then should called dispatch every each word", async () => {
      jest.useFakeTimers();
      const expectInput = "Magic Search";
      const expectButton = "To search";
      const userTyped = "Hello word";

      const expectActions_1 = "Hello";
      const expectActions_2 = "word";

      render(<MagicSearch />);
      const input = screen.getByRole("textbox", { name: expectInput });
      const button = screen.getByRole("button", { name: expectButton });

      fireEvent.change(input, { target: { value: userTyped } });
      fireEvent.click(button);

      jest.runAllTimers();

      expect(mockAction).toHaveBeenCalledWith(expectActions_1, 0, false);
      expect(mockAction).toHaveBeenCalledWith(expectActions_2, 1, false);
    });
  });
});
