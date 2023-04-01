import { PictSequence } from "../../types/sequence";
import {
  fireEvent,
  preloadedState,
  render,
  screen,
} from "../../utils/test-utils";
import PictEditSettings from "./PictEditSettings";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

beforeEach(() => jest.clearAllMocks());

describe("Give a component Setting Pictograms list", () => {
  describe("When rendered with index pictogram and user click type setting", () => {
    test("Then should call dispatch with action update", () => {
      const mockPictogram: PictSequence = {
        indexSequence: 0,
        img: {
          searched: { word: "", bestIdPicts: [0] },
          selectedId: 0,
          settings: { skin: "asian" },
        },
        settings: { ...preloadedState.sequence[0].settings },
      };

      const buttonOpenSettings = "Settings Pictogram";
      const expectTypeSetting = "Asian";
      const actionCreator = {
        payload: { indexSequence: 0, settings: { skin: "asian" } },
        type: "sequence/skin",
      };

      render(
        <PictEditSettings
          indexPict={mockPictogram.indexSequence}
          pictApiAraSettings={mockPictogram.img.settings}
          pictSequenceSettings={mockPictogram.settings}
        />,
        {
          preloadedState: preloadedState,
        }
      );
      const button = screen.getByRole("button", { name: buttonOpenSettings });
      fireEvent.click(button);

      const typeSetting = screen.getByRole("button", {
        name: expectTypeSetting,
      });
      fireEvent.click(typeSetting);

      expect(typeSetting).toBeInTheDocument();
      expect(mockDispatch).toHaveBeenCalledWith(actionCreator);
    });
  });
});
