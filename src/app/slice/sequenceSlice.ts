import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  PictSequenceApplyAll,
  SequenceForEdit,
  PictSequenceForEdit,
  PictApiAraForEdit,
  PictApiAraSettingsApplyAll,
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

    selectedId: (
      previousSequence,
      action: PayloadAction<PictApiAraForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.selectedId = action.payload.selectedId!)
      );
    },

    searched: (previousSequence, action: PayloadAction<PictApiAraForEdit>) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.searched = action.payload.searched!)
      );
    },

    settingsPictApiAra: (
      previousSequence,
      action: PayloadAction<PictApiAraForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.settings = action.payload.settings!)
      );
    },

    settingsPictSequence: (
      previousSequence,
      action: PayloadAction<SequenceForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.settings = action.payload.settings!)
      );
    },

    textPosition: (
      previousSequence,
      action: PayloadAction<PictSequenceForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          action.payload.textPosition &&
          (pictogram.settings.textPosition = action.payload.textPosition)
      );
    },

    fontSize: (
      previousSequence,
      action: PayloadAction<PictSequenceForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          action.payload.fontSize &&
          (pictogram.settings.fontSize = action.payload.fontSize)
      );
    },

    borderIn: (
      previousSequence,
      action: PayloadAction<PictSequenceForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.settings.borderIn = action.payload.borderIn!)
      );
    },

    borderOut: (
      previousSequence,
      action: PayloadAction<PictSequenceForEdit>
    ) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.settings.borderOut = action.payload.borderOut!)
      );
    },

    skin: (previousSequence, action: PayloadAction<PictApiAraForEdit>) => {
      previousSequence.map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.settings.skin = action.payload.settings?.skin!)
      );
    },

    skinApplyAll: (
      previousSequence,
      action: PayloadAction<PictApiAraSettingsApplyAll>
    ) => {
      previousSequence.map(
        (pictogram) => (pictogram.img.settings.skin = action.payload.skin!)
      );
    },

    textPositionApplyAll: (
      previousSequence,
      action: PayloadAction<PictSequenceApplyAll>
    ) => {
      previousSequence.map(
        (pictogram) =>
          (pictogram.settings.textPosition = action.payload.textPosition!)
      );
    },

    borderInApplyAll: (
      previousSequence,
      action: PayloadAction<PictSequenceApplyAll>
    ) => {
      previousSequence.map(
        (pictogram) => (pictogram.settings.borderIn = action.payload.borderIn!)
      );
    },

    borderOutApplyAll: (
      previousSequence,
      action: PayloadAction<PictSequenceApplyAll>
    ) => {
      previousSequence.map(
        (pictogram) =>
          (pictogram.settings.borderOut = action.payload.borderOut!)
      );
    },

    fontSizeApplyAll: (
      previousSequence,
      action: PayloadAction<PictSequenceApplyAll>
    ) => {
      previousSequence.map(
        (pictogram) => (pictogram.settings.fontSize = action.payload.fontSize!)
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
  selectedId: selectedIdActionCreator,
  searched: searchedActionCreator,
  textPosition: textPositionActionCreator,
  fontSize: fontSizeActionCreator,
  borderIn: borderInActionCreator,
  borderOut: borderOutActionCreator,
  skin: skinActionCreator,
  skinApplyAll: skinApplyAllActionCreator,
  textPositionApplyAll: textPositionApplyAllActionCreator,
  borderInApplyAll: borderInApplyAllActionCreator,
  borderOutApplyAll: borderOutApplyAllActionCreator,
  fontSizeApplyAll: fontSizeApplyAllActionCreator,
  settingsPictApiAra: settingsPictApiAraActionCreator,
  settingsPictSequence: settingsPictSequenceActionCreator,
} = sequenceSlice.actions;
