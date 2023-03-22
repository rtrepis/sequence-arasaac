import App from "./App";
import { preloadedState, render, screen } from "./utils/test-utils";

jest.mock("./hooks/useAraSaac", () => () => ({
  getSearchPictogram: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

describe("Give a App", () => {
  describe("When it's rendered with title", () => {
    test("Then should show this title", () => {
      const expectTitle = "Sequence - AraSaac";

      render(<App />, { preloadedState: { ...preloadedState } });
      const title = screen.getByRole("heading", {
        name: expectTitle,
        level: 1,
      });
      screen.debug();

      expect(title).toBeInTheDocument();
    });
  });
});
