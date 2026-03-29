import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "components.barNavigation.title",
    defaultMessage: "SequenciAAC",
    description: "App title translate Sequence",
  },
  skipToContent: {
    id: "components.barNavigation.skipToContent",
    defaultMessage: "Skip to main content",
    description: "Enllaç d'accés ràpid al contingut principal per a teclat/lector de pantalla",
  },
  mainNavigation: {
    id: "components.barNavigation.mainNavigation",
    defaultMessage: "Main navigation",
    description: "Etiqueta ARIA per a la barra de navegació principal",
  },
  view: {
    id: "components.barNavigation.view.title",
    defaultMessage: "View",
    description: "Title Page",
  },
  edit: {
    id: "components.barNavigation.edit.title",
    defaultMessage: "Edit",
    description: "Title Page",
  },
  welcome: {
    id: "components.barNavigation.welcome.title",
    defaultMessage: "Welcome",
    description: "Title Page",
  },
  upload: {
    id: "components.defaultSettings.upload",
    defaultMessage: "Load settings from local file",
    description: "Load settings from local file",
  },
  download: {
    id: "components.defaultSettings.download",
    defaultMessage: "Save settings to local file",
    description: "Save settings to local file",
  },
});

export default messages;
