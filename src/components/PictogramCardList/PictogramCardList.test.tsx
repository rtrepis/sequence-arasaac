import { render, screen } from "@testing-library/react";
import { SequenceI } from "../../types/sequence";
import PictogramCardList from "./PictogramCardList";

describe("Give a component PictogramCardList", () => {
  describe("When a rendered with sequence array", () => {
    test("Then should show all results of array", () => {
      const sequence: SequenceI = [
        { index: 0, number: 2333 },
        { index: 1, number: 2333 },
        { index: 2, number: 2333 },
      ];

      render(<PictogramCardList sequence={sequence} />);
      const images = screen.getAllByRole("img");

      expect(images).toHaveLength(sequence.length);
    });
  });
});
