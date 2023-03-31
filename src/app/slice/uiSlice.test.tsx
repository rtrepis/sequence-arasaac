import { UpDateSettingsPictApiAra } from "../../types/sequence";
import { Ui } from "../../types/ui";
import { preloadedState } from "../../utils/test-utils";
import {
  uiReducer,
  updateDefaultSettingPictApiAraActionCreator,
} from "./uiSlice";

describe("Given the reducer uiSlice", () => {
  const previousUiSlice: Ui = {
    ...preloadedState.ui,
    defaultSettings: {
      ...preloadedState.ui.defaultSettings,
      pictApiAra: { skin: "white" },
    },
  };
  describe("When called `upDateSkin` with SkinPayload", () => {
    test("Then it should changed the property to the new state", () => {
      const newProperty: UpDateSettingsPictApiAra = {
        settings: { skin: "asian" },
      };
      const expectState: Ui = {
        ...preloadedState.ui,
        defaultSettings: {
          ...preloadedState.ui.defaultSettings,
          pictApiAra: { skin: "asian" },
        },
      };

      const actionCreator =
        updateDefaultSettingPictApiAraActionCreator(newProperty);
      const newState = uiReducer(previousUiSlice, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
