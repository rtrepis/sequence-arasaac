import { UiI, UiSkinsI } from "../../types/ui";
import { uiReducer, updateSkinActionCreator } from "./uiSlice";

describe("Given the reducer uiSlice", () => {
  const previousUiSlice: UiI = { setting: { skin: "default" } };
  describe("When called `upDateSkin` with SkinPayload", () => {
    test("Then it should changed the property to the new state", () => {
      const newProperty: UiSkinsI = "asian";
      const expectState: UiI = {
        ...previousUiSlice,
        setting: { skin: newProperty },
      };

      const actionCreator = updateSkinActionCreator(newProperty);
      const newState = uiReducer(previousUiSlice, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
