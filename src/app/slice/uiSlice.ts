import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DefaultSettingsPictApiAraForEdit,
  DefaultSettingsPictSequenceForEdit,
  Ui,
} from "../../types/ui";

const uiInitialState: Ui = {
  defaultSettings: {
    pictApiAra: { skin: "white", fitzgerald: "#666666" },
    pictSequence: {
      numbered: false,
      textPosition: "bottom",
      borderIn: { color: "fitzgerald", radius: 20, size: 2 },
      borderOut: { color: "#999", radius: 20, size: 2 },
    },
  },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    updateDefaultSettingPictApiAra: (
      previousUi,
      action: PayloadAction<DefaultSettingsPictApiAraForEdit>
    ) => ({
      ...previousUi,
      defaultSettings: {
        ...previousUi.defaultSettings,
        pictApiAra: {
          ...previousUi.defaultSettings.pictApiAra,
          ...action.payload,
        },
      },
    }),
    updateDefaultSettingPictSequence: (
      previousUi,
      action: PayloadAction<DefaultSettingsPictSequenceForEdit>
    ) => ({
      ...previousUi,
      defaultSettings: {
        ...previousUi.defaultSettings,
        pictSequence: {
          ...previousUi.defaultSettings.pictSequence,
          ...action.payload,
        },
      },
    }),
  },
});

export const uiReducer = uiSlice.reducer;

export const {
  updateDefaultSettingPictApiAra: updateDefaultSettingPictApiAraActionCreator,
  updateDefaultSettingPictSequence:
    updateDefaultSettingPictSequenceActionCreator,
} = uiSlice.actions;
