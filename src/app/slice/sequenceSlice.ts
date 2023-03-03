import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PictogramI, SequenceI } from "../../types/sequence";

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
  },
});

export const sequenceReducer = sequenceSlice.reducer;

export const {
  addPictogram: addPictogramActionCreator,
  subtractPictogram: subtractPictogramActionCreator,
} = sequenceSlice.actions;
