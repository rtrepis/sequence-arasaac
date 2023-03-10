import { defineMessage } from "react-intl";
import { SettingsI } from "../types/sequence";

const Settings: SettingsI = {
  skins: {
    name: "skin",
    message: defineMessage({
      id: "settings.skins.label",
      defaultMessage: "Skin",
      description: "Setting skin label",
    }),
    types: [
      {
        name: "asian",
        message: defineMessage({
          id: "settings.skins.asian",
          defaultMessage: "Asian",
          description: "Type of setting skin",
        }),
      },
      {
        name: "aztec",
        message: defineMessage({
          id: "settings.skins.aztec",
          defaultMessage: "Aztec",
          description: "Type of setting skin",
        }),
      },
      {
        name: "black",
        message: defineMessage({
          id: "settings.skins.black",
          defaultMessage: "Black",
          description: "Type of setting skin",
        }),
      },
      {
        name: "mulatto",
        message: defineMessage({
          id: "settings.skins.mulatto",
          defaultMessage: "Mulatto",
          description: "Type of setting skin",
        }),
      },
      {
        name: "white",
        message: defineMessage({
          id: "settings.skins.white",
          defaultMessage: "White",
          description: "Type of setting skin",
        }),
      },
    ],
  },
};

export default Settings;
