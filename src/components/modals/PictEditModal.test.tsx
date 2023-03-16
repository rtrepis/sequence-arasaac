import userEvent from "@testing-library/user-event/";
import { fireEvent, render, screen } from "../../utils/test-utils";
import PictEditModal from "./PictEditModal";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../hooks/useAraSaac", () => () => ({
  getSearchPictogram: jest.fn(),
}));

let preloadedStateMock = {
  sequence: [
    {
      index: 0,
      number: 26527,
      border: {
        in: { color: "blue", radius: 20, size: 2 },
        out: { color: "green", radius: 20, size: 2 },
      },
      word: { keyWord: "Empty" },
    },
  ],
  ui: {
    setting: { skin: "default" },
    modal: { pictEdit: { isOpen: true, indexPict: 0 } },
  },
};

describe("Give a component PictEditModal", () => {
  describe("When it's rendered with state property indexPict 1", () => {
    test("Then should show title, indexPict, settings first pictogram sequence", () => {
      const indexPict = 0;
      preloadedStateMock.ui.modal.pictEdit.indexPict = indexPict;
      const expectInModal = {
        title: "Edit Pictogram",
        indexPict: "1",
        pictogram: "Pictogram",
        settings: "Settings",
      };

      render(<PictEditModal />, { preloadedState: preloadedStateMock });

      const AreInModal = [];
      AreInModal[0] = screen.getByRole("heading", {
        name: expectInModal.title,
      });
      AreInModal[1] = screen.getByRole("heading", {
        name: expectInModal.indexPict,
      });
      AreInModal[2] = screen.getByRole("img", {
        name: expectInModal.pictogram,
      });
      AreInModal[3] = screen.getByRole("button", {
        name: expectInModal.settings,
      });

      AreInModal.forEach((isInModal) => expect(isInModal).toBeInTheDocument());
    });
  });

  describe("When user click on Settings and buttons setting skin type", () => {
    test("Then called dispatch action", () => {
      const expectSettings = "Settings";
      const skins = ["Asian", "Aztec", "Black", "Mulatto", "White", "Default"];

      render(<PictEditModal />, { preloadedState: preloadedStateMock });
      const buttonSetting = screen.getByRole("button", {
        name: expectSettings,
      });
      fireEvent.click(buttonSetting);

      skins.forEach((skin) => {
        const expectAction = {
          payload: { index: 0, item: "skin", value: skin.toLowerCase() },
          type: "sequence/upDateSettingItem",
        };

        const button = screen.getByRole("button", { name: skin });

        fireEvent.click(button);

        expect(mockDispatch).toBeCalledWith(expectAction);
      });
    });
  });

  describe("When user type escape", () => {
    test("Then called dispatch action close", async () => {
      const expectAction = {
        payload: { indexPict: 0, isOpen: false },
        type: "uiState/pictEditModal",
      };

      render(<PictEditModal />, { preloadedState: preloadedStateMock });
      const modal = screen.getByRole("heading", {
        name: "Edit Pictogram",
      });
      await userEvent.type(modal, "{escape}");

      expect(mockDispatch).toBeCalledWith(expectAction);
    });
  });
});
