import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictogramI,
  SequenceI,
  UpdateSettingI,
  ProtoPictogramI,
  UpdatePictWordI,
} from "../../types/sequence";
import { SettingPayloadI } from "../../types/ui";

const sequenceInitialState: SequenceI = [];

const sequenceSlice = createSlice({
  name: "sequence",
  initialState: sequenceInitialState,
  reducers: {
    addPictogram: (previousSequence, action: PayloadAction<PictogramI>) => [
      ...previousSequence,
      action.payload,
    ],

    subtractPictogram: (previousSequence, action: PayloadAction<number>) =>
      previousSequence.filter(
        (pictogram) => pictogram.index !== action.payload
      ),
    subtractLastPict: (previousSequence) => [...previousSequence.slice(0, -1)],

    addSequence: (previousSequence, action: PayloadAction<SequenceI>) =>
      action.payload,

    renumberSequence: (previousSequence) =>
      previousSequence.map((pictogram, indexArray) => ({
        ...pictogram,
        index: indexArray,
      })),

    upDatePictNumber: (
      previousSequence,
      action: PayloadAction<ProtoPictogramI>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.index &&
          (pictogram.number = action.payload.number)
      );
    },

    upDatePictWord: (
      previousSequence,
      action: PayloadAction<UpdatePictWordI>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexPict &&
          (pictogram.word = action.payload.word)
      );
    },

    upDateSetting: (
      previousSequence,
      action: PayloadAction<UpdateSettingI>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.index &&
          (pictogram[action.payload.setting] = action.payload.value)
      );
    },

    applyAllSetting: (
      previousSequence,
      action: PayloadAction<SettingPayloadI>
    ) => {
      previousSequence.map(
        (pictogram) =>
          (pictogram[action.payload.setting] = action.payload.value)
      );
    },
  },
});

export const sequenceReducer = sequenceSlice.reducer;

export const {
  addPictogram: addPictogramActionCreator,
  subtractPictogram: subtractPictogramActionCreator,
  subtractLastPict: subtractLastPictActionCreator,
  addSequence: addSequenceActionCreator,
  renumberSequence: renumberSequenceActionCreator,
  upDatePictNumber: upDatePictNumberActionCreator,
  upDatePictWord: upDatePictWordActionCreator,
  applyAllSetting: applyAllSettingActionCreator,
  upDateSetting: upDateSettingActionCreator,
} = sequenceSlice.actions;
