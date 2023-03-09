import { PictogramI, SequenceI } from "../../types/sequence";
import { SettingItemPayloadI } from "../../types/ui";
import {
  addPictogramActionCreator,
  sequenceReducer,
  subtractPictogramActionCreator,
  applyAllSettingItemActionCreator,
} from "./sequenceSlice";

describe("Given the reducer sequenceSlice", () => {
  let previousSequence: SequenceI = [{ index: 0, number: 0 }];
  describe("When call 'addPictogram' with pictogram payload", () => {
    test("Then should new state is same previous add new pictogram", () => {
      const pictogram: PictogramI = { index: 1, number: 2220 };
      const expectState = [...previousSequence, pictogram];

      const actionCreator = addPictogramActionCreator(pictogram);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When call `subtractPictogram'", () => {
    test("Then should new state is same previous subtract last pictogram", () => {
      const expectState = [...previousSequence].slice(0, -1);

      const actionCreator = subtractPictogramActionCreator();
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'applyAllSettingItem' with applyAllPayload", () => {
    test("Then should new state change all property of pictogram", () => {
      previousSequence = [{ index: 0, number: 0, skin: "default" }];
      const applyAllPayload: SettingItemPayloadI = {
        item: "skin",
        value: "black",
      };
      const expectState = [{ index: 0, number: 0, skin: "black" }];

      const actionCreator = applyAllSettingItemActionCreator(applyAllPayload);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
