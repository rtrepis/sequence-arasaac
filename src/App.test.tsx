import { render, screen } from "@testing-library/react";
import App from "./App";

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
