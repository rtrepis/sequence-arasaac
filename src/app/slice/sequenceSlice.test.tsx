import {
  PictApiAraSettings,
  PictSequence,
  Sequence,
  SequenceForEdit,
} from "../../types/sequence";
import { preloadedState } from "../../utils/test-utils";
import {
  addPictogramActionCreator,
  sequenceReducer,
  subtractLastPictActionCreator,
  selectedIdActionCreator,
  searchedActionCreator,
  addSequenceActionCreator,
  subtractPictogramActionCreator,
  renumberSequenceActionCreator,
  sortSequenceActionCreator,
  settingsPictSequenceActionCreator,
  skinApplyAllActionCreator,
} from "./sequenceSlice";

const mockSequences = preloadedState.sequence[0];

describe("Given the reducer sequenceSlice", () => {
  let previousSequence: Sequence = [
    {
      ...preloadedState.sequence[0],
      indexSequence: 0,
      img: {
        ...preloadedState.sequence[0].img,
        selectedId: 0,
        searched: {
          ...preloadedState.sequence[0].img.searched,
          word: "",
        },
      },
    },
  ];

  describe("When call 'addPictogram' with pictogram payload", () => {
    test("Then should new state is same previous add new pictogram", () => {
      const pictogram: PictSequence = {
        ...preloadedState.sequence[0],
        indexSequence: 1,
        img: {
          ...preloadedState.sequence[0].img,
          selectedId: 2220,
          searched: {
            ...preloadedState.sequence[0].img.searched,
            word: "",
          },
        },
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
      const expectState: Sequence = [];

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

  describe("When call 'addSequence' with sequence payload", () => {
    test("Then should new state is same sequence payload", () => {
      const sequence: Sequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 1,
          img: {
            ...preloadedState.sequence[0].img,
            selectedId: 2220,
            searched: {
              ...preloadedState.sequence[0].img.searched,
              word: "",
            },
          },
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
      const previousTest: Sequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 1,
        },
      ];
      const expectState = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
        },
      ];
      const actionCreator = renumberSequenceActionCreator();
      const newState = sequenceReducer(previousTest, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'PictApiAraSelectedId' with ProtoPictSequence", () => {
    test("Then should new state with update pictogram of sequence", () => {
      const upDatePictogramNumber = {
        indexSequence: 0,
        selectedId: 1254,
      };
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
          img: {
            ...preloadedState.sequence[0].img,
            searched: {
              ...preloadedState.sequence[0].img.searched,
              word: "",
            },
          },
        },
      ];

      const expectState: PictSequence[] = [
        {
          ...previousSequence[0],
          indexSequence: 0,
          img: { ...previousSequence[0].img, selectedId: 1254 },
        },
      ];

      const actionCreator = selectedIdActionCreator(upDatePictogramNumber);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'upDatePictSearched' with upDatePictWordI", () => {
    test("Then should new state with update pictogram of sequence", () => {
      const upDatePictogramWord = {
        indexSequence: 0,
        searched: { word: "testWord", bestIdPicts: [99, 66] },
      };
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
          img: {
            ...preloadedState.sequence[0].img,
            selectedId: 0,
            searched: {
              ...preloadedState.sequence[0].img.searched,
              word: "",
            },
          },
        },
      ];

      const expectState: PictSequence[] = [
        {
          ...previousSequence[0],
          indexSequence: 0,
          img: {
            ...previousSequence[0].img,
            searched: { ...upDatePictogramWord.searched },
          },
        },
      ];

      const actionCreator = searchedActionCreator(upDatePictogramWord);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'applyAllSetting' with applyAllPayload", () => {
    test("Then should new state change all property of pictogram", () => {
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
          img: {
            selectedId: 0,
            searched: { ...mockSequences.img.searched, word: "" },
            settings: { skin: "white", fitzgerald: "#22f" },
          },
        },
      ];
      const applyAllPayload: PictApiAraSettings = {
        skin: "black",
      };

      const expectState: PictSequence[] = [
        {
          ...previousSequence[0],
          indexSequence: 0,
          img: {
            ...previousSequence[0].img,
            selectedId: 0,
            settings: { skin: "black", fitzgerald: "#22f" },
          },
        },
      ];

      const actionCreator = skinApplyAllActionCreator(applyAllPayload);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'sortSequence'", () => {
    test("Then should new state orderly for indexSequence", () => {
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 1,
        },
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
        },
      ];
      const expectState: PictSequence[] = [
        {
          ...previousSequence[0],
          indexSequence: 0,
        },
        {
          ...previousSequence[0],
          indexSequence: 1,
        },
      ];

      const actionCreator = sortSequenceActionCreator();
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });

  describe("When called 'upDateSettingsPictApiAra' with UpdateSettingsPictSequence", () => {
    test("Then should new state with update PictSettingPictApiAra", () => {
      const toUpDatePictSettings: SequenceForEdit = {
        indexSequence: 0,
        settings: {
          ...preloadedState.sequence[0].settings,
          textPosition: "top",
        },
      };
      previousSequence = [
        {
          ...preloadedState.sequence[0],
          indexSequence: 0,
          settings: {
            ...preloadedState.sequence[0].settings,
            textPosition: "bottom",
          },
        },
      ];

      const expectState: PictSequence[] = [
        {
          ...previousSequence[0],
          indexSequence: 0,
          settings: {
            ...preloadedState.sequence[0].settings,
            textPosition: "top",
          },
        },
      ];

      const actionCreator =
        settingsPictSequenceActionCreator(toUpDatePictSettings);
      const newState = sequenceReducer(previousSequence, actionCreator);

      expect(newState).toStrictEqual(expectState);
    });
  });
});
