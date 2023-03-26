import { SettingToUpdate } from "../../types/sequence";
import { Ui } from "../../types/ui";
import { preloadedState } from "../../utils/test-utils";
import { uiReducer, updateSkinActionCreator } from "./uiSlice";

describe("Given the reducer uiSlice", () => {
  const previousUiSlice: Ui = {
    ...preloadedState.ui,
    defaultSettings: {
      ...preloadedState.ui.defaultSettings,
      PictApiAra: { skin: "default" },
    },
  };
  describe("When called `upDateSkin` with SkinPayload", () => {
    test("Then it should changed the property to the new state", () => {
      const newProperty: SettingToUpdate = { setting: "skin", value: "asian" };
      const expectState: Ui = {
        ...preloadedState.ui,
        defaultSettings: {
          ...preloadedState.ui.defaultSettings,
          PictApiAra: { skin: "asian" },
        },
      };

      const actionCreator = updateSkinActionCreator(newProperty);
      const newState = uiReducer(previousUiSlice, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
