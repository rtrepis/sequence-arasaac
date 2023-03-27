import {
  render,
  screen,
  act,
  fireEvent,
  preloadedState,
  State,
} from "../../utils/test-utils";
import PictogramSearch from "./PictogramSearch";

let mockAction = jest.fn();
jest.mock("../../hooks/useAraSaac", () => () => ({
  getSearchPictogram: mockAction,
  toUrlPath: mockAction,
}));

const mockDispatch = jest.fn();
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useDispatch: () => mockDispatch,
}));

beforeEach(() => jest.clearAllMocks());

describe("Give component PictogramSearch", () => {
  describe("When rendered with word pictogram empty", () => {
    test("Then should show text search in input", () => {
      const expectText = "Search";
      const mockState = {
        ...preloadedState,
        sequence: [
          {
            ...preloadedState.sequence[0],
            pictogram: {
              ...preloadedState.sequence[0].img,
              searched: {
                ...preloadedState.sequence[0].img.searched,
                word: "Empty",
              },
            },
          },
        ],
      };

      render(<PictogramSearch indexPict={0} />, {
        preloadedState: mockState,
      });
      const input = screen.getByRole("textbox", { name: expectText });

      expect(input).toBeInTheDocument();
    });
  });

  describe("When user typed word and click search", () => {
    test("Then should it's called mockAction with typed and indexPict", () => {
      const expectInput = "Search";
      const expertButton = "toSearch";
      const typeWordSearch = "boy";
      const indexPict = 0;

      render(<PictogramSearch indexPict={indexPict} />, {
        preloadedState: preloadedState,
      });

      const input = screen.getByRole("textbox", { name: expectInput });
      const button = screen.getByRole("button", { name: expertButton });

      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        fireEvent.change(input, {
          target: { value: typeWordSearch },
        });
        fireEvent.click(button);
      });

      expect(mockAction).toHaveBeenCalledWith(typeWordSearch, indexPict, true);
    });
  });

  describe("When state findPict is length 2", () => {
    test("Then should it's same length to image and click", () => {
      const expectFindPict = [324, 234];
      const expectLabelImage = "Pictogram test";
      const mockState: State = {
        ...preloadedState,
        sequence: [
          {
            ...preloadedState.sequence[0],
            img: {
              ...preloadedState.sequence[0].img,
              searched: {
                ...preloadedState.sequence[0].img.searched,
                bestIdPicts: expectFindPict,
              },
            },
          },
        ],
      };

      render(<PictogramSearch indexPict={0} />, {
        preloadedState: mockState,
      });

      const images = screen.getAllByRole("img", {
        name: `${expectLabelImage}`,
      });
      const buttons = screen.getAllByRole("button", {
        name: `Pictogram`,
      });

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);

      expect(images).toHaveLength(expectFindPict.length);
    });
  });

  describe("When state findPict is length 1 with -1", () => {
    test("Then should show alert to not found", async () => {
      const expectFindPict = [-1];
      const mockState: State = {
        ...preloadedState,
        sequence: [
          {
            ...preloadedState.sequence[0],
            img: {
              ...preloadedState.sequence[0].img,
              searched: {
                ...preloadedState.sequence[0].img.searched,
                bestIdPicts: expectFindPict,
              },
            },
          },
        ],
      };

      render(<PictogramSearch indexPict={0} />, {
        preloadedState: mockState,
      });

      const alert = screen.getByRole("alert", { name: "" });

      expect(alert).toBeInTheDocument();
    });
  });
});
