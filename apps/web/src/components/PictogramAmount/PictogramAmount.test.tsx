import { fireEvent, render, screen } from "../../utils/test-utils";
import PictogramAmount from "./PictogramAmount";

describe("Give a component PictogramAmount", () => {
  describe("When is rendered", () => {
    test("Then should show it's all elements", () => {
      const expectElements = {
        label: "Pictograms:",
        add: "Add pictogram",
        subtract: "Subtract pictogram",
      };

      render(<PictogramAmount />);

      const elements: HTMLElement[] = [];
      Object.values(expectElements).forEach((expectElement) =>
        elements.push(screen.getByLabelText(expectElement))
      );

      elements.forEach((element) => expect(element).toBeInTheDocument());
    });
  });

  describe("When user click buttons '+' and '-'", () => {
    test("Then should show amount change a unit", () => {
      const ButtonsClick = {
        "+": "Add pictogram",
        "-": "Subtract pictogram",
      };
      const amount = "Pictograms:";

      render(<PictogramAmount />);

      const buttons: HTMLElement[] = [];
      Object.values(ButtonsClick).forEach((ButtonClick) =>
        buttons.push(screen.getByRole("button", { name: ButtonClick }))
      );

      const input = screen.getByRole("textbox", { name: amount });

      fireEvent.click(buttons[1]);
      expect(input).toHaveValue("1");
      fireEvent.click(buttons[0]);
      expect(input).toHaveValue("0");
    });
  });
});
