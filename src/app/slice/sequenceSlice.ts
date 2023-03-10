import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictogramI,
  SequenceI,
  UpdateSettingItemI,
} from "../../types/sequence";
import { SettingItemPayloadI } from "../../types/ui";

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
    applyAllSettingItem: (
      previousSequence,
      action: PayloadAction<SettingItemPayloadI>
    ) => {
      previousSequence.forEach((pictogram) => {
        pictogram[action.payload.item] = action.payload.value;
      });
    },
    upDateSettingItem: (
      previousSequence,
      action: PayloadAction<UpdateSettingItemI>
    ) => {
      previousSequence.forEach(
        (pictogram, index) =>
          index === action.payload.index &&
          (pictogram[action.payload.item] = action.payload.value)
      );
    },
  },
});

export const sequenceReducer = sequenceSlice.reducer;

export const {
  addPictogram: addPictogramActionCreator,
  subtractPictogram: subtractPictogramActionCreator,
  applyAllSettingItem: applyAllSettingItemActionCreator,
  upDateSettingItem: upDateSettingItemActionCreator,
} = sequenceSlice.actions;
