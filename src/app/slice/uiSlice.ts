import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UpdateSettingItemI } from "../../types/sequence";
import { UiI, PictEditI } from "../../types/ui";

const uiInitialState: UiI = {
  setting: {
    skin: "default",
  },
  modal: {
    pictEdit: {
      isOpen: false,
      indexPict: NaN,
    },
  },
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    updateSkin: (previousUi, action: PayloadAction<UpdateSettingItemI>) => ({
      ...previousUi,
      setting: { ...previousUi.setting, skin: action.payload.value },
    }),

    pictEditModal: (previousUi, action: PayloadAction<PictEditI>) => ({
      ...previousUi,
      modal: { ...previousUi.modal, pictEdit: action.payload },
    }),
  },
});

export const uiReducer = uiSlice.reducer;

export const {
  updateSkin: updateSkinActionCreator,
  pictEditModal: pictEditModalActionCreator,
} = uiSlice.actions;
