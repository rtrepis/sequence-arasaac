import { render, screen, act, fireEvent } from "../../utils/test-utils";
import PictogramSearch from "./PictogramSearch";
import { useState } from "react";

const mockAction = jest.fn();

jest.mock("../../hooks/useAraSaac", () => () => ({
  getSearchPictogram: mockAction,
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

describe("Give component PictogramSearch", () => {
  beforeEach(() => {
    (useState as jest.Mock).mockImplementation(
      jest.requireActual("react").useState
    );
  });
  describe("When rendered with array findPictogram empty", () => {
    test("Then should show text search in input", () => {
      const expectText = "Search";

      render(<PictogramSearch action={mockAction} />);
      const input = screen.getByRole("textbox", { name: expectText });

      expect(input).toBeInTheDocument();
    });
  });

  describe("When user typed word and enter in input", () => {
    test("Then should it's called mockAction", () => {
      const expectInput = "Search";
      const expertButton = "toSearch";
      const typeWordSearch = "boy";

      render(<PictogramSearch action={mockAction} />);

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
    test("Then should it's same length to image", () => {
      const expectFindPict = [324, 234];
      const expectLabelImage = "pictogram";
      const mockSetFindPict = jest.fn();

      (useState as jest.Mock).mockImplementation(() => [
        [324, 234],
        mockSetFindPict,
      ]);

      render(<PictogramSearch action={mockAction} />);

      const images = screen.getAllByRole("img", { name: expectLabelImage });

      expect(images).toHaveLength(expectFindPict.length);
    });
  });

  describe("When state findPict is length 1 with -1", () => {
    test("Then should show alert to not found", () => {
      const mockSetFindPict = jest.fn();

      (useState as jest.Mock).mockImplementation(() => [[-1], mockSetFindPict]);

      render(<PictogramSearch action={mockAction} />);

      const alert = screen.getByRole("alert", { name: "" });

      expect(alert).toBeInTheDocument();
    });
  });
});
