import { UpdateSettingItemI } from "../../types/sequence";
import { PictEditI, UiI } from "../../types/ui";
import { preloadedState } from "../../utils/test-utils";
import {
  pictEditModalActionCreator,
  uiReducer,
  updateSkinActionCreator,
} from "./uiSlice";

describe("Given the reducer uiSlice", () => {
  const previousUiSlice: UiI = {
    ...preloadedState.ui,
    setting: { skin: "default" },
  };
  describe("When called `upDateSkin` with SkinPayload", () => {
    test("Then it should changed the property to the new state", () => {
      const newProperty: UpdateSettingItemI = { item: "skin", value: "asian" };
      const expectState: UiI = {
        ...previousUiSlice,
        setting: { skin: "asian" },
      };

      const actionCreator = updateSkinActionCreator(newProperty);
      const newState = uiReducer(previousUiSlice, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'pictEditModal' with PictEdit object", () => {
    test("Then it's should changed state pictEdit", () => {
      const newProperty: PictEditI = { indexPict: 0, isOpen: true };
      const expectState: UiI = {
        ...previousUiSlice,
        modal: { pictEdit: newProperty },
      };

      const actionCreator = pictEditModalActionCreator(newProperty);
      const newState = uiReducer(previousUiSlice, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
