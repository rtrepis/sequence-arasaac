import App from "./App";
import { render, screen } from "./utils/test-utils";

describe("Give a App", () => {
  describe("When it's rendered with title", () => {
    test("Then should show this title", () => {
      const expectTitle = "Sequence - AraSaac";

      render(<App />);
      const title = screen.getByRole("heading", {
        name: expectTitle,
        level: 1,
      });

      expect(title).toBeInTheDocument();
    });
  });
});
