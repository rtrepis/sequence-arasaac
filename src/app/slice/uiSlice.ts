import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DefaultSettings,
  DefaultSettingsPictApiAraForEdit,
  DefaultSettingsPictSequenceForEdit,
  Ui,
  ViewSettings,
} from "../../types/ui";

const uiInitialState: Ui = {
  viewSettings: {
    sizePict: 1,
    columnGap: 1,
    rowGap: 1,
  },
  defaultSettings: {
    pictApiAra: {
      skin: "white",
      fitzgerald: "#666666",
      hair: "brown",
      color: true,
    },
    pictSequence: {
      numbered: false,
      textPosition: "bottom",
      font: {
        color: "#000000",
        family: "Roboto",
        size: 1,
      },
      borderIn: { color: "fitzgerald", radius: 20, size: 2 },
      borderOut: { color: "#999999", radius: 20, size: 2 },
    },
  },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    viewSettings: (previousUi, action: PayloadAction<ViewSettings>) => ({
      ...previousUi,
      viewSettings: action.payload,
    }),

    updateDefaultSettings: (
      previousUi,
      action: PayloadAction<DefaultSettings>
    ) => ({
      ...previousUi,
      defaultSettings: action.payload,
    }),

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
  viewSettings: viewSettingsActionCreator,
  updateDefaultSettings: updateDefaultSettingsActionCreator,
  updateDefaultSettingPictApiAra: updateDefaultSettingPictApiAraActionCreator,
  updateDefaultSettingPictSequence:
    updateDefaultSettingPictSequenceActionCreator,
} = uiSlice.actions;
