import { defineMessage, defineMessages } from "react-intl";
import { SettingsCardLang } from "../../types/sequence.lang";

export const settingsCardLang: SettingsCardLang = {
  messages: {
    skin: defineMessage({
      id: "settings.skins.label",
      defaultMessage: "Skin",
      description: "Setting skin label",
    }),
    textPosition: defineMessage({
      id: "settings.textPosition.label",
      defaultMessage: "Text Position",
      description: "Setting Text Position label",
    }),
  },
  skin: {
    asian: {
      message: defineMessage({
        id: "settings.skins.asian",
        defaultMessage: "Asian",
        description: "Type of setting skin",
      }),
    },

    aztec: {
      message: defineMessage({
        id: "settings.skins.aztec",
        defaultMessage: "Aztec",
        description: "Type of setting skin",
      }),
    },
    black: {
      message: defineMessage({
        id: "settings.skins.black",
        defaultMessage: "Black",
        description: "Type of setting skin",
      }),
    },
    mulatto: {
      message: defineMessage({
        id: "settings.skins.mulatto",
        defaultMessage: "Mulatto",
        description: "Type of setting skin",
      }),
    },
    white: {
      message: defineMessage({
        id: "settings.skins.white",
        defaultMessage: "White",
        description: "Type of setting skin",
      }),
    },
  },
  textPosition: {
    top: {
      message: defineMessage({
        id: "settings.textPosition.top",
        defaultMessage: "Top",
        description: "Type of setting text position",
      }),
    },
    bottom: {
      message: defineMessage({
        id: "settings.textPosition.bottom",
        defaultMessage: "Bottom",
        description: "Type of setting text position",
      }),
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
