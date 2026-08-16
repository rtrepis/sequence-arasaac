import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DefaultSettings,
  DefaultSettingsPictApiAraForEdit,
  DefaultSettingsPictSequenceForEdit,
  ThemeMode,
  Ui,
  ViewSettings,
  SettingsTab,
  UserTier,
} from "@/types/ui";
import { WordProfile } from "@features/word-profile/model/WordProfile";
import {
  VIEW_DEFAULT_SIZE_PICT,
  VIEW_DEFAULT_PICT_SPACE,
  VIEW_DEFAULT_SEQ_SPACE,
  VIEW_DEFAULT_DIRECTION,
  VIEW_DEFAULT_PAGE_SIZE,
  VIEW_DEFAULT_ORIENTATION,
  VIEW_DEFAULT_ALIGNMENT_H,
  VIEW_DEFAULT_ALIGNMENT_V,
  VIEW_DEFAULT_AUTHOR,
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

// La llengua inicial es "en" per defecte; AppBootstrap l'actualitza al muntar
// amb la preferència guardada o la llengua del navegador.
const uiInitialState: Ui = {
  lang: { app: "en", search: "en", keywords: [] },
  theme: "system",
  settingsActiveTab: "user",
  viewSettings: {
    sizePict: VIEW_DEFAULT_SIZE_PICT,
    pictSpaceBetween: VIEW_DEFAULT_PICT_SPACE,
    sequenceSpaceBetween: VIEW_DEFAULT_SEQ_SPACE,
    direction: VIEW_DEFAULT_DIRECTION,
    alignmentH: VIEW_DEFAULT_ALIGNMENT_H,
    alignmentV: VIEW_DEFAULT_ALIGNMENT_V,
    pageSize: VIEW_DEFAULT_PAGE_SIZE,
    orientation: VIEW_DEFAULT_ORIENTATION,
    author: VIEW_DEFAULT_AUTHOR,
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
  wordProfiles: [],
  tier: "free",
};

const uiSlice = createSlice({
  name: "uiState",
  initialState: uiInitialState,
  reducers: {
    // Només els idiomes: les keywords són dades d'ARASAAC que carrega
    // useArasaacKeywords, i qui canvia l'idioma no en sap res.
    //
    // Abans el payload les portava (sempre buides) i les esborrava. Quan la
    // resposta de la sessió arribava després d'haver-les carregat —cosa que passa
    // sempre si el servidor s'està engegant— i l'idioma no havia canviat, l'efecte
    // que les carrega no es tornava a executar i el cercador es quedava sense cap
    // paraula d'ARASAAC: només hi sortien les del vocabulari propi.
    updateLangSetting: (
      previousUi,
      action: PayloadAction<Pick<Ui["lang"], "app" | "search">>,
    ) => ({
      ...previousUi,
      lang: {
        ...previousUi.lang,
        app: action.payload.app,
        search: action.payload.search,
      },
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

    updateTheme: (previousUi, action: PayloadAction<ThemeMode>) => ({
      ...previousUi,
      theme: action.payload,
    }),

    updateSettingsActiveTab: (previousUi, action: PayloadAction<SettingsTab>) => ({
      ...previousUi,
      settingsActiveTab: action.payload,
    }),

    addWordProfile: (previousUi, action: PayloadAction<WordProfile>) => {
      const filtered = previousUi.wordProfiles.filter(
        (p) => p.word.toLowerCase() !== action.payload.word.toLowerCase(),
      );
      previousUi.wordProfiles = [...filtered, action.payload];
    },

    removeWordProfile: (previousUi, action: PayloadAction<string>) => {
      previousUi.wordProfiles = previousUi.wordProfiles.filter(
        (p) => p.word.toLowerCase() !== action.payload.toLowerCase(),
      );
    },

    // Carregat des del backend en fer login
    setWordProfiles: (previousUi, action: PayloadAction<WordProfile[]>) => {
      previousUi.wordProfiles = action.payload;
    },

    setTier: (previousUi, action: PayloadAction<UserTier>) => {
      previousUi.tier = action.payload;
    },
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
  updateTheme: updateThemeActionCreator,
  updateSettingsActiveTab: updateSettingsActiveTabActionCreator,
  addWordProfile: addWordProfileActionCreator,
  removeWordProfile: removeWordProfileActionCreator,
  setWordProfiles: setWordProfilesActionCreator,
  setTier: setTierActionCreator,
} = uiSlice.actions;
