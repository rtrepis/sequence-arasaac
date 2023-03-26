import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SettingToUpdate } from "../../types/sequence";
import { Ui } from "../../types/ui";

const uiInitialState: Ui = {
  defaultSettings: { PictApiAra: { skin: "white" } },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    updateSkin: (previousUi, action: PayloadAction<SettingToUpdate>) => ({
      ...previousUi,
      defaultSettings: {
        PictApiAra: { [action.payload.setting]: action.payload.value },
      },
    }),
  },
});

export const uiReducer = uiSlice.reducer;

export const { updateSkin: updateSkinActionCreator } = uiSlice.actions;
