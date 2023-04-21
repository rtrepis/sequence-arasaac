import { Sequence } from "../../types/sequence";
import { preloadedState, render, screen } from "../../utils/test-utils";
import PictEditModalList from "./PictEditModalList";

const mockSequence = preloadedState.sequence[0];

describe("Give a component PictogramCardList", () => {
  describe("When a rendered with sequence array", () => {
    test("Then should show all results of array", () => {
      const sequence: Sequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
          img: {
            ...preloadedState.sequence[0].img,
            selectedId: 2333,
          },
        },
        {
          ...preloadedState.sequence[0],
          indexSequence: 1,
          img: {
            ...preloadedState.sequence[0].img,
            selectedId: 2333,
          },
        },
        {
          ...preloadedState.sequence[0],
          indexSequence: 2,
          img: {
            ...preloadedState.sequence[0].img,
            selectedId: 2333,
          },
        },
      ];

      render(<PictEditModalList sequence={sequence} />);
      const images = screen.getAllByRole("img");

      expect(images).toHaveLength(sequence.length);
    });
  });
});
