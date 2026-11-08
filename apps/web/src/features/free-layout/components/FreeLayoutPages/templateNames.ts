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
  "agenda-strip": messages.templateAgendaStrip,
  "today-agenda": messages.templateTodayAgenda,
  "first-then": messages.templateFirstThen,
  week: messages.templateWeek,
  "token-board": messages.templateTokenBoard,
  "story-page": messages.templateStoryPage,
  menu: messages.templateMenu,
};

/**
 * El text amb què neix el rètol d'un espai de plantilla, per la clau de
 * l'espai (`TemplateSlot.label`). Es tradueix a l'idioma de la interfície en
 * crear el rètol; després és contingut del document i ja no es tradueix.
 */
export const TEMPLATE_SLOT_TEXTS: Record<string, MessageDescriptor> = {
  today: messages.slotTextToday,
  first: messages.slotTextFirst,
  then: messages.slotTextThen,
  monday: messages.slotTextMonday,
  tuesday: messages.slotTextTuesday,
  wednesday: messages.slotTextWednesday,
  thursday: messages.slotTextThursday,
  friday: messages.slotTextFriday,
  workingFor: messages.slotTextWorkingFor,
  firstCourse: messages.slotTextFirstCourse,
  secondCourse: messages.slotTextSecondCourse,
  dessert: messages.slotTextDessert,
};
