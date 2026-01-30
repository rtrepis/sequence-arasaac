import { Sequence } from "./sequence";
import { DefaultSettings } from "./ui";

export interface DocumentSAAC {
  id: string;
  title?: string;
  content: { [key: number]: Sequence };
  activeSAAC: number;
  order?: number[];
  author?: string;
  defaultSettings?: DefaultSettings;
}
