import {
  PictogramI,
  ProtoPictogramI,
  SequenceI,
  UpdatePictWordI,
  UpdateSettingItemI,
} from "../../types/sequence";
import { SettingItemPayloadI } from "../../types/ui";
import {
  addPictogramActionCreator,
  sequenceReducer,
  subtractPictogramActionCreator,
  applyAllSettingItemActionCreator,
  upDateSettingItemActionCreator,
  upDatePictNumberActionCreator,
  upDatePictWordActionCreator,
} from "./sequenceSlice";

describe("Given the reducer sequenceSlice", () => {
  let previousSequence: SequenceI = [
    { index: 0, number: 0, word: { keyWord: "" } },
  ];
  describe("When call 'addPictogram' with pictogram payload", () => {
    test("Then should new state is same previous add new pictogram", () => {
      const pictogram: PictogramI = {
        index: 1,
        number: 2220,
        word: { keyWord: "" },
      };
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

  describe("When called 'upDatePictNumber' with ProtoPictogramI", () => {
    test("Then should new state with update pictogram of sequence", () => {
      const upDatePictogramNumber: ProtoPictogramI = {
        index: 0,
        number: 1254,
      };
      previousSequence = [{ index: 0, number: 0, word: { keyWord: "" } }];

      const expectState = [{ ...previousSequence[0], index: 0, number: 1254 }];

      const actionCreator = upDatePictNumberActionCreator(
        upDatePictogramNumber
      );
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'upDatePictWord' with upDatePictWordI", () => {
    test("Then should new state with update pictogram of sequence", () => {
      const upDatePictogramWord: UpdatePictWordI = {
        indexPict: 0,
        word: { keyWord: "testWord" },
      };
      previousSequence = [{ index: 0, number: 0, word: { keyWord: "" } }];

      const expectState = [
        { ...previousSequence[0], index: 0, word: { keyWord: "testWord" } },
      ];

      const actionCreator = upDatePictWordActionCreator(upDatePictogramWord);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'applyAllSettingItem' with applyAllPayload", () => {
    test("Then should new state change all property of pictogram", () => {
      previousSequence = [
        { index: 0, number: 0, skin: "default", word: { keyWord: "" } },
      ];
      const applyAllPayload: SettingItemPayloadI = {
        item: "skin",
        value: "black",
      };
      const expectState = [
        { ...previousSequence[0], index: 0, number: 0, skin: "black" },
      ];

      const actionCreator = applyAllSettingItemActionCreator(applyAllPayload);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'upDateSettingItem' with UpdateSettingItem", () => {
    test("Then should new state with update PictogramSetting", () => {
      const upDatePictogramSetting: UpdateSettingItemI = {
        index: 0,
        item: "skin",
        value: "asian",
      };
      previousSequence = [
        { index: 0, number: 0, skin: "default", word: { keyWord: "" } },
        { index: 1, number: 0, skin: "black", word: { keyWord: "" } },
      ];

      const expectState = [
        { ...previousSequence[0], index: 0, number: 0, skin: "asian" },
        { ...previousSequence[1], index: 1, number: 0, skin: "black" },
      ];

      const actionCreator = upDateSettingItemActionCreator(
        upDatePictogramSetting
      );
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
