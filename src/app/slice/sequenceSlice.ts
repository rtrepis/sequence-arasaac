import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  UpdateSelectedId,
  UpdateSearched,
  UpDateSettingsPictApiAra,
  upDateSettingsPictSequence,
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

    sortSequence: (previousSequence) =>
      previousSequence.sort((a, b) => a.indexSequence - b.indexSequence),

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

    upDateSettingsPictApiAra: (
      previousSequence,
      action: PayloadAction<UpDateSettingsPictApiAra>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.settings = action.payload.settings)
      );
    },

    upDateSettingsPictSequence: (
      previousSequence,
      action: PayloadAction<upDateSettingsPictSequence>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.settings = action.payload.settings)
      );
    },

    applyAllSettingPictApiAra: (
      previousSequence,
      action: PayloadAction<UpDateSettingsPictApiAra>
    ) => {
      previousSequence.map(
        (pictogram) => (pictogram.img.settings = action.payload.settings)
      );
    },

    applyAllSettingPictSequence: (
      previousSequence,
      action: PayloadAction<upDateSettingsPictSequence>
    ) => {
      previousSequence.map(
        (pictogram) => (pictogram.settings = action.payload.settings)
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
  sortSequence: sortSequenceActionCreator,
  upDatePictSelectedId: upDatePictSelectedIdActionCreator,
  upDatePictSearched: upDatePictSearchedActionCreator,
  applyAllSettingPictApiAra: applyAllSettingPictApiAraActionCreator,
  applyAllSettingPictSequence: applyAllSettingPictSequenceActionCreator,
  upDateSettingsPictApiAra: upDateSettingsPictApiAraActionCreator,
  upDateSettingsPictSequence: upDateSettingsPictSequenceActionCreator,
} = sequenceSlice.actions;
