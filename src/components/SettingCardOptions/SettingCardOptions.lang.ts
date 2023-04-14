import { defineMessages } from "react-intl";
import { SettingsCardOptionsLang } from "../../types/sequence.lang";

export const settingCardOptions: SettingsCardOptionsLang = {
  messages: {
    languages: {
      id: "setting.lang.title",
      defaultMessage: "Language",
      description: "Title setting",
    },
  },
  languages: {
    en: {
      message: {
        id: "setting.lang.en.label",
        defaultMessage: "English",
        description: "Type setting",
      },
    },
    ca: {
      message: {
        id: "setting.lang.ca.label",
        defaultMessage: "Catalan",
        description: "Type setting",
      },
    },
    es: {
      message: {
        id: "setting.lang.es.label",
        defaultMessage: "Spanish",
        description: "Type setting",
      },
    },
  },
};

export const messages = defineMessages({
  default: {
    id: "components.settingCard.default.label",
    defaultMessage: "Default",
    description: "Not type setting ",
  },
  applyAll: {
    id: "components.settingCard.applyAll.label",
    defaultMessage: "Apply All",
    description: "apply to all pictograms",
  },
});
