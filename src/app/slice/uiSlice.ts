import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  UpDateSettingsPictApiAra,
  upDateSettingsPictSequence,
} from "../../types/sequence";
import { Ui } from "../../types/ui";

const uiInitialState: Ui = {
  defaultSettings: {
    pictApiAra: { skin: "white" },
    pictSequence: { textPosition: "bottom" },
  },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    updateDefaultSettingPictApiAra: (
      previousUi,
      action: PayloadAction<UpDateSettingsPictApiAra>
    ) => ({
      ...previousUi,
      defaultSettings: {
        ...previousUi.defaultSettings,
        pictApiAra: {
          ...previousUi.defaultSettings.pictApiAra,
          ...action.payload.settings,
        },
      },
    }),
    updateDefaultSettingPictSequence: (
      previousUi,
      action: PayloadAction<upDateSettingsPictSequence>
    ) => ({
      ...previousUi,
      defaultSettings: {
        ...previousUi.defaultSettings,
        pictSequence: {
          ...previousUi.defaultSettings.pictSequence,
          ...action.payload.settings,
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
