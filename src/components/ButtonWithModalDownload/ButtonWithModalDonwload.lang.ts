import { defineMessages } from "react-intl";

const messages = defineMessages({
  download: {
    id: "components.buttonWithModalDownload.download.label",
    defaultMessage: "Download",
    description: "helper text",
  },
  save: {
    id: "components.buttonWithModalDownload.save.title",
    defaultMessage: "Save",
    description: "Modal tittle",
  },
  saveHelper: {
    id: "components.buttonWithModalDownload.saveHelper.label",
    defaultMessage:
      "Save the sequence and/or default settings, and load them later",
    description: "Helper save modal",
  },
  defaultSettings: {
    id: "components.buttonWithModalDownload.defaultSettings.label",
    defaultMessage: "Default settings",
    description: "Type save checkbox",
  },
  sequence: {
    id: "components.buttonWithModalDownload.sequence.label",
    defaultMessage: "Sequence",
    description: "Type save checkbox",
  },
  filename: {
    id: "components.buttonWithModalDownload.filename.label",
    defaultMessage: "File name",
    description: "Type save checkbox",
  },
});

export default messages;
