import { UpdateSettingI } from "../../types/sequence";
import { UiI } from "../../types/ui";
import { preloadedState } from "../../utils/test-utils";
import { uiReducer, updateSkinActionCreator } from "./uiSlice";

describe("Given the reducer uiSlice", () => {
  const previousUiSlice: UiI = {
    ...preloadedState.ui,
    setting: { skin: "default" },
  };
  describe("When called `upDateSkin` with SkinPayload", () => {
    test("Then it should changed the property to the new state", () => {
      const newProperty: UpdateSettingI = { setting: "skin", value: "asian" };
      const expectState: UiI = {
        ...previousUiSlice,
        setting: { skin: "asian" },
      };

      const actionCreator = updateSkinActionCreator(newProperty);
      const newState = uiReducer(previousUiSlice, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
