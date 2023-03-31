import { Skins, TextPosition } from "./sequence";

export interface SettingsCardLang {
  messages: {
    skin: Message;
    textPosition: Message;
  };
  skin: {
    [K in Skins]: { message: Message };
  };
  textPosition: {
    [K in TextPosition]: { message: Message };
  };
}

export interface Message {
  id: string;
  description?: string;
  defaultMessage: string;
}
