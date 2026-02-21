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
import {
  VIEW_DEFAULT_SIZE_PICT,
  VIEW_DEFAULT_PICT_SPACE,
  VIEW_DEFAULT_SEQ_SPACE,
  VIEW_DEFAULT_DIRECTION,
} from "@/configs/viewSettingsConfig";
import {
  DEFAULT_SKIN,
  DEFAULT_HAIR,
  DEFAULT_FITZGERALD,
  DEFAULT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_COLOR,
  DEFAULT_BORDER_IN_COLOR,
  DEFAULT_BORDER_IN_RADIUS,
  DEFAULT_BORDER_IN_SIZE,
  DEFAULT_BORDER_OUT_COLOR,
  DEFAULT_BORDER_OUT_RADIUS,
  DEFAULT_BORDER_OUT_SIZE,
} from "@/configs/defaultSettingsConfig";

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
    sizePict: VIEW_DEFAULT_SIZE_PICT,
    pictSpaceBetween: VIEW_DEFAULT_PICT_SPACE,
    sequenceSpaceBetween: VIEW_DEFAULT_SEQ_SPACE,
    direction: VIEW_DEFAULT_DIRECTION,
  },
  defaultSettings: {
    pictApiAra: {
      skin: DEFAULT_SKIN,
      fitzgerald: DEFAULT_FITZGERALD,
      hair: DEFAULT_HAIR,
      color: DEFAULT_COLOR,
    },
    pictSequence: {
      numbered: false,
      textPosition: "bottom",
      font: {
        color: DEFAULT_FONT_COLOR,
        family: DEFAULT_FONT_FAMILY,
        size: DEFAULT_FONT_SIZE,
      },
      numberFont: {
        color: DEFAULT_FONT_COLOR,
        family: DEFAULT_FONT_FAMILY,
        size: DEFAULT_FONT_SIZE,
      },
      borderIn: {
        color: DEFAULT_BORDER_IN_COLOR,
        radius: DEFAULT_BORDER_IN_RADIUS,
        size: DEFAULT_BORDER_IN_SIZE,
      },
      borderOut: {
        color: DEFAULT_BORDER_OUT_COLOR,
        radius: DEFAULT_BORDER_OUT_RADIUS,
        size: DEFAULT_BORDER_OUT_SIZE,
      },
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
