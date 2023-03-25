import {
  PictogramI,
  ProtoPictogramI,
  SequenceI,
  UpdatePictWordI,
  UpdateSettingI,
} from "../../types/sequence";
import { SettingPayloadI } from "../../types/ui";
import { preloadedState } from "../../utils/test-utils";
import {
  addPictogramActionCreator,
  sequenceReducer,
  subtractLastPictActionCreator,
  applyAllSettingActionCreator,
  upDateSettingActionCreator,
  upDatePictNumberActionCreator,
  upDatePictWordActionCreator,
  addSequenceActionCreator,
  subtractPictogramActionCreator,
  renumberSequenceActionCreator,
} from "./sequenceSlice";

const mockSequences = preloadedState.sequence[0];

describe("Given the reducer sequenceSlice", () => {
  let previousSequence: SequenceI = [
    {
      ...preloadedState.sequence[0],
      index: 0,
      number: 0,
      word: { ...mockSequences.word, keyWord: "" },
    },
  ];
  describe("When call 'addPictogram' with pictogram payload", () => {
    test("Then should new state is same previous add new pictogram", () => {
      const pictogram: PictogramI = {
        ...preloadedState.sequence[0],
        index: 1,
        number: 2220,
        word: { ...mockSequences.word, keyWord: "" },
      };
      const expectState = [...previousSequence, pictogram];

      const actionCreator = addPictogramActionCreator(pictogram);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When call `subtractPictogram'", () => {
    test("Then should new state is same previous subtract index pictogram", () => {
      const subtractIndexPictogram = 0;
      const expectState: SequenceI = [];

      const actionCreator = subtractPictogramActionCreator(
        subtractIndexPictogram
      );
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When call `subtractLasPict'", () => {
    test("Then should new state is same previous subtract last pictogram", () => {
      const expectState = [...previousSequence].slice(0, -1);

      const actionCreator = subtractLastPictActionCreator();
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When call 'addPhrase' with sequence payload", () => {
    test("Then should new state is same sequence payload", () => {
      const sequence: SequenceI = [
        {
          ...preloadedState.sequence[0],
          index: 1,
          number: 2220,
          word: { ...mockSequences.word, keyWord: "" },
        },
      ];
      const expectState = [...sequence];

      const actionCreator = addSequenceActionCreator(sequence);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When call 'renumberSequence' with sequence payload", () => {
    test("Then should new state is same sequence payload", () => {
      const previousTest: SequenceI = [
        {
          ...preloadedState.sequence[0],
          index: 1,
        },
      ];
      const expectState = [
        {
          ...preloadedState.sequence[0],
          index: 0,
        },
      ];
      const actionCreator = renumberSequenceActionCreator();
      const newState = sequenceReducer(previousTest, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'upDatePictNumber' with ProtoPictogramI", () => {
    test("Then should new state with update pictogram of sequence", () => {
      const upDatePictogramNumber: ProtoPictogramI = {
        index: 0,
        number: 1254,
      };
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          index: 0,
          number: 0,
          word: { ...mockSequences.word, keyWord: "" },
        },
      ];

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
        word: { keyWord: "testWord", pictograms: [99, 66] },
      };
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          index: 0,
          number: 0,
          word: { ...mockSequences.word, keyWord: "" },
        },
      ];

      const expectState = [
        {
          ...previousSequence[0],
          index: 0,
          word: { ...upDatePictogramWord.word },
        },
      ];

      const actionCreator = upDatePictWordActionCreator(upDatePictogramWord);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'applyAllSetting' with applyAllPayload", () => {
    test("Then should new state change all property of pictogram", () => {
      previousSequence = [
        {
          index: 0,
          number: 0,
          skin: "default",
          word: { ...mockSequences.word, keyWord: "" },
        },
      ];
      const applyAllPayload: SettingPayloadI = {
        setting: "skin",
        value: "black",
      };
      const expectState = [
        { ...previousSequence[0], index: 0, number: 0, skin: "black" },
      ];

      const actionCreator = applyAllSettingActionCreator(applyAllPayload);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'upDateSetting' with UpdateSetting", () => {
    test("Then should new state with update PictogramSetting", () => {
      const upDatePictogramSetting: UpdateSettingI = {
        index: 0,
        setting: "skin",
        value: "asian",
      };
      previousSequence = [
        {
          index: 0,
          number: 0,
          skin: "default",
          word: { ...mockSequences.word, keyWord: "" },
        },
        {
          index: 1,
          number: 0,
          skin: "black",
          word: { ...mockSequences.word, keyWord: "" },
        },
      ];

      const expectState = [
        { ...previousSequence[0], index: 0, number: 0, skin: "asian" },
        { ...previousSequence[1], index: 1, number: 0, skin: "black" },
      ];

      const actionCreator = upDateSettingActionCreator(upDatePictogramSetting);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
