import type { MessageDescriptor } from "react-intl";
import messages from "./FreeLayoutPages.lang";

/** El nom de cada plantilla, per l'`id` de la plantilla: el selector del full i el de la columna. */
export const TEMPLATE_NAMES: Record<string, MessageDescriptor> = {
  full: messages.templateFull,
  "rows-2": messages.templateRows2,
  "columns-2": messages.templateColumns2,
  "rows-3": messages.templateRows3,
  "grid-2x2": messages.templateGrid2x2,
  "strip-top": messages.templateStripTop,
};
