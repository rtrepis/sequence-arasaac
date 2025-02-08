import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DefaultSettings,
  DefaultSettingsPictApiAraForEdit,
  DefaultSettingsPictSequenceForEdit,
  LangsApp,
  Ui,
  ViewSettings,
} from "../../types/ui";
import {
  langTranslateApp,
  langTranslateSearch,
} from "/src/configs/languagesConfigs";

const localeBrowser = navigator.language.slice(0, 2);

const langSettings =
  sessionStorage.getItem("langSettings") ??
  localStorage.getItem("langSettings");

let userLangSettings: null | Ui["lang"] = null;
if (langSettings !== null) {
  userLangSettings = JSON.parse(langSettings) as Ui["lang"];
}

const localeAPP = (
  userLangSettings?.app
    ? userLangSettings.app
    : langTranslateApp.includes(localeBrowser as LangsApp)
      ? localeBrowser
      : "en"
) as LangsApp;

const localeSearch = userLangSettings?.search
  ? userLangSettings.search
  : langTranslateSearch.includes(localeBrowser as LangsApp)
    ? localeBrowser
    : "en";

const uiInitialState: Ui = {
  lang: { app: localeAPP, search: localeSearch, keywords: [] },
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
    updateLangSetting: (previousUi, action: PayloadAction<Ui["lang"]>) => ({
      ...previousUi,
      lang: action.payload,
    }),

    viewSettings: (previousUi, action: PayloadAction<ViewSettings>) => ({
      ...previousUi,
      viewSettings: action.payload,
    }),

    updateDefaultSettings: (
      previousUi,
      action: PayloadAction<DefaultSettings>,
    ) => ({
      ...previousUi,
      defaultSettings: action.payload,
    }),

    updateDefaultSettingPictApiAra: (
      previousUi,
      action: PayloadAction<DefaultSettingsPictApiAraForEdit>,
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
      action: PayloadAction<DefaultSettingsPictSequenceForEdit>,
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

    updateKeywords: (previousUi, action: PayloadAction<string[]>) => ({
      ...previousUi,
      lang: { ...previousUi.lang, keywords: [...action.payload] },
    }),
  },
});

export const uiReducer = uiSlice.reducer;

export const {
  viewSettings: viewSettingsActionCreator,
  updateLangSetting: updateLangSettingsActionCreator,
  updateDefaultSettings: updateDefaultSettingsActionCreator,
  updateDefaultSettingPictApiAra: updateDefaultSettingPictApiAraActionCreator,
  updateDefaultSettingPictSequence:
    updateDefaultSettingPictSequenceActionCreator,
  updateKeywords: updateKeywordsActionCreator,
} = uiSlice.actions;
