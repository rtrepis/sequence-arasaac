import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UiI, UiSkinsI } from "../../types/ui";

const uiInitialState: UiI = {
  setting: {
    skin: "default",
  },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    updateSkin: (previousUi, action: PayloadAction<UiSkinsI>) => ({
      ...previousUi,
      setting: { ...previousUi.setting, skin: action.payload },
    }),
  },
});

export const uiReducer = uiSlice.reducer;

export const { updateSkin: updateSkinActionCreator } = uiSlice.actions;
