import { defineMessage } from "react-intl";
import { SettingsCardOptionsLang } from "../../../../types/sequence.lang";
import { LANGUAGE_NAMES } from "@shared/constants/languageNames";

export const settingCardOptions: SettingsCardOptionsLang = {
  messages: {
    languagesApp: defineMessage({
      id: "setting.lang.app.title",
      defaultMessage: "App",
      description: "Title setting",
    }),
    languagesSearch: defineMessage({
      id: "setting.lang.search.title",
      defaultMessage: "Search",
      description: "Title setting",
    }),
  },

  languages: LANGUAGE_NAMES,
};
