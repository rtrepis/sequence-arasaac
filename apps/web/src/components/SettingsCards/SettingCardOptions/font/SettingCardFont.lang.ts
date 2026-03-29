import { defineMessage } from "react-intl";
import { SettingsCardOptionsFont } from "../../../../types/sequence.lang";

export const settingCardOptions: SettingsCardOptionsFont = {
  messages: {
    fontFamily: defineMessage({
      id: "setting.font-family.title",
      defaultMessage: "Family",
      description: "Title setting",
    }),
  },
};
