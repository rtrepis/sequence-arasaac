import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UpdateSettingI } from "../../types/sequence";
import { UiI } from "../../types/ui";

const uiInitialState: UiI = {
  setting: {
    skin: "white",
  },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    updateSkin: (previousUi, action: PayloadAction<UpdateSettingI>) => ({
      ...previousUi,
      setting: { ...previousUi.setting, skin: action.payload.value },
    }),
  },
});

export const uiReducer = uiSlice.reducer;

export const { updateSkin: updateSkinActionCreator } = uiSlice.actions;
