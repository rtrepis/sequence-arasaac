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

    subtractPictogram: (previousSequence) => [...previousSequence.slice(0, -1)],

    upDatePictNumber: (
      previousSequence,
      action: PayloadAction<ProtoPictogramI>
    ) => {
      previousSequence.forEach(
        (pictogram, index) =>
          index === action.payload.index &&
          (pictogram.number = action.payload.number)
      );
    },

    applyAllSetting: (
      previousSequence,
      action: PayloadAction<SettingPayloadI>
    ) => {
      previousSequence.forEach((pictogram) => {
        pictogram[action.payload.setting] = action.payload.value;
      });
    },

    upDatePictWord: (
      previousSequence,
      action: PayloadAction<UpdatePictWordI>
    ) => {
      previousSequence.forEach(
        (pictogram, index) =>
          index === action.payload.indexPict &&
          (pictogram.word = action.payload.word)
      );
    },

    upDateSetting: (
      previousSequence,
      action: PayloadAction<UpdateSettingI>
    ) => {
      previousSequence.forEach(
        (pictogram, index) =>
          index === action.payload.index &&
          (pictogram[action.payload.setting] = action.payload.value)
      );
    },
  },
});

export const sequenceReducer = sequenceSlice.reducer;

export const {
  addPictogram: addPictogramActionCreator,
  subtractPictogram: subtractPictogramActionCreator,
  upDatePictNumber: upDatePictNumberActionCreator,
  upDatePictWord: upDatePictWordActionCreator,
  applyAllSetting: applyAllSettingActionCreator,
  upDateSetting: upDateSettingActionCreator,
} = sequenceSlice.actions;
