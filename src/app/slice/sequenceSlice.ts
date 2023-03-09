import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PictogramI, SequenceI } from "../../types/sequence";
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
  },
});

export const sequenceReducer = sequenceSlice.reducer;

export const {
  addPictogram: addPictogramActionCreator,
  subtractPictogram: subtractPictogramActionCreator,
  applyAllSettingItem: applyAllSettingItemActionCreator,
} = sequenceSlice.actions;
