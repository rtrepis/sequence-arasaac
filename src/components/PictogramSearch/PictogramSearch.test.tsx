import { render, screen, act, fireEvent } from "../../utils/test-utils";
import PictogramSearch from "./PictogramSearch";
import { useState } from "react";

let mockAction = jest.fn();
const mockDispatch = jest.fn();

jest.mock("../../hooks/useAraSaac", () => () => ({
  getSearchPictogram: mockAction,
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
  useDispatch: () => mockDispatch,
}));

beforeEach(() => jest.clearAllMocks());

describe("Give component PictogramSearch", () => {
  beforeEach(() => {
    (useState as jest.Mock).mockImplementation(
      jest.requireActual("react").useState
    );
  });
  describe("When rendered with array findPictogram empty", () => {
    test("Then should show text search in input", () => {
      const expectText = "Search";

      render(<PictogramSearch indexPict={0} />);
      const input = screen.getByRole("textbox", { name: expectText });

      expect(input).toBeInTheDocument();
    });
  });

  describe("When user typed word and click search", () => {
    test("Then should it's called mockAction", () => {
      const expectInput = "Search";
      const expertButton = "toSearch";
      const typeWordSearch = "boy";

      render(<PictogramSearch indexPict={0} />);

      const input = screen.getByRole("textbox", { name: expectInput });
      const button = screen.getByRole("button", { name: expertButton });

      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        fireEvent.change(input, {
          target: { value: typeWordSearch },
        });
        fireEvent.click(button);
      });

      expect(mockAction).toBeCalledWith(typeWordSearch);
    });
  });

  describe("When state findPict is length 2", () => {
    test("Then should it's same length to image and click", () => {
      const expectFindPict = [324, 234];
      const expectLabelImage = "pictogram";
      const mockSetFindPict = jest.fn();

      (useState as jest.Mock).mockImplementation(() => [
        [324, 234],
        mockSetFindPict,
      ]);

      render(<PictogramSearch indexPict={0} />);

      const images = screen.getAllByRole("img", { name: expectLabelImage });
      const buttons = screen.getAllByRole("button", { name: "pictogram" });

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);

      expect(images).toHaveLength(expectFindPict.length);
    });
  });

  describe("When state findPict is length 1 with -1", () => {
    test("Then should show alert to not found", async () => {
      const mockSetFindPict = jest.fn();

      (useState as jest.Mock).mockImplementation(() => [[-1], mockSetFindPict]);

      render(<PictogramSearch indexPict={0} />);

      const alert = screen.getByRole("alert", { name: "" });

      expect(alert).toBeInTheDocument();
    });
  });
});
