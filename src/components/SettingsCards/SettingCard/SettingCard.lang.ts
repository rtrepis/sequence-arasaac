import { defineMessage } from "react-intl";
import { SettingsCardLang } from "../../../types/sequence.lang";

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
    hair: defineMessage({
      id: "settings.hair.label",
      defaultMessage: "Hair",
      description: "Setting Hair label",
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
    none: {
      message: defineMessage({
        id: "settings.textPosition.none",
        defaultMessage: "None",
        description: "Type of setting text position",
      }),
    },
  },
  hair: {
    black: {
      message: defineMessage({
        id: "settings.hair.black",
        defaultMessage: "Black",
        description: "Type of setting text position",
      }),
    },
    blonde: {
      message: defineMessage({
        id: "settings.hair.blonde",
        defaultMessage: "Blonde",
        description: "Type of setting text position",
      }),
    },
    brown: {
      message: defineMessage({
        id: "settings.hair.brown",
        defaultMessage: "Brown",
        description: "Type of setting text position",
      }),
    },
    darkBrown: {
      message: defineMessage({
        id: "settings.hair.darkBrown",
        defaultMessage: "Dark Brown",
        description: "Type of setting text position",
      }),
    },
    darkGray: {
      message: defineMessage({
        id: "settings.hair.darkGray",
        defaultMessage: "Dark Gray",
        description: "Type of setting text position",
      }),
    },
    gray: {
      message: defineMessage({
        id: "settings.hair.gray",
        defaultMessage: "Gray",
        description: "Type of setting text position",
      }),
    },
    red: {
      message: defineMessage({
        id: "settings.hair.red",
        defaultMessage: "Red",
        description: "Type of setting text position",
      }),
    },
  },
};
