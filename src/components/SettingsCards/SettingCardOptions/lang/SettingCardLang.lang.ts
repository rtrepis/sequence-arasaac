import { defineMessage } from "react-intl";
import { SettingsCardOptionsLang } from "../../../../types/sequence.lang";

export const settingCardOptions: SettingsCardOptionsLang = {
  messages: {
    languages: defineMessage({
      id: "setting.lang.title",
      defaultMessage: "Language",
      description: "Title setting",
    }),
  },

  languages: {
    en: {
      message: defineMessage({
        id: "setting.lang.en.label",
        defaultMessage: "English",
        description: "Type setting",
      }),
    },
    ca: {
      message: defineMessage({
        id: "setting.lang.ca.label",
        defaultMessage: "Catalan",
        description: "Type setting",
      }),
    },
    es: {
      message: defineMessage({
        id: "setting.lang.es.label",
        defaultMessage: "Spanish",
        description: "Type setting",
      }),
    },
  },
};
