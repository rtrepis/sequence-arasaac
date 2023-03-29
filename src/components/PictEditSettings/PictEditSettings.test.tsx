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
      const indexPictogram = 0;
      const buttonOpenSettings = "Settings Pictogram";
      const expectTypeSetting = "Asian";
      const actionCreator = {
        payload: { indexSequence: 0, setting: "skin", value: "asian" },
        type: "sequence/upDateSetting",
      };

      render(<PictEditSettings indexPict={indexPictogram} />, {
        preloadedState: preloadedState,
      });
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
