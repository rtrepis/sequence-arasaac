import { Languages, Skin, TextPosition, Hair } from "./sequence";

export interface SettingsCardLang {
  messages: {
    skin: Message;
    textPosition: Message;
    hair: Message;
  };
  skin: {
    [K in Skin]: { message: Message };
  };
  textPosition: {
    [K in TextPosition]: { message: Message };
  };
  hair: {
    [K in Hair]: { message: Message };
  };
}

export interface SettingsCardOptionsLang {
  messages: {
    languages: Message;
  };
  languages: {
    [K in Languages]: { message: Message };
  };
}

export interface Message {
  id: string;
  description?: string;
  defaultMessage: string;
}
