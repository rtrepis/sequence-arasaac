import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  UpdateSelectedId,
  UpdateSearched,
  SettingToUpdate,
  UpdateAllSetting,
} from "../../types/sequence";

const sequenceInitialState: Sequence = [];

const sequenceSlice = createSlice({
  name: "sequence",
  initialState: sequenceInitialState,
  reducers: {
    addPictogram: (previousSequence, action: PayloadAction<PictSequence>) => [
      ...previousSequence,
      action.payload,
    ],

    subtractPictogram: (previousSequence, action: PayloadAction<number>) =>
      previousSequence.filter(
        (pictogram) => pictogram.indexSequence !== action.payload
      ),
    subtractLastPict: (previousSequence) => [...previousSequence.slice(0, -1)],

    addSequence: (previousSequence, action: PayloadAction<Sequence>) =>
      action.payload,

    renumberSequence: (previousSequence) =>
      previousSequence.map((pictogram, index) => ({
        ...pictogram,
        indexSequence: index,
      })),

    upDatePictSelectedId: (
      previousSequence,
      action: PayloadAction<UpdateSelectedId>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.selectedId = action.payload.selectedId)
      );
    },

    upDatePictSearched: (
      previousSequence,
      action: PayloadAction<UpdateSearched>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.searched = action.payload.searched)
      );
    },

    upDateSetting: (
      previousSequence,
      action: PayloadAction<SettingToUpdate>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.settings[action.payload.setting] =
            action.payload.value)
      );
    },

    applyAllSetting: (
      previousSequence,
      action: PayloadAction<UpdateAllSetting>
    ) => {
      previousSequence.map(
        (pictogram) =>
          (pictogram.img.settings[action.payload.setting] =
            action.payload.value)
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
  upDatePictSelectedId: upDatePictSelectedIdActionCreator,
  upDatePictSearched: upDatePictSearchedActionCreator,
  applyAllSetting: applyAllSettingActionCreator,
  upDateSetting: upDateSettingActionCreator,
} = sequenceSlice.actions;
