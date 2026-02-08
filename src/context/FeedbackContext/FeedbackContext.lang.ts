import { defineMessages } from "react-intl";

// Missatges de feedback per a les diferents accions de l'aplicació
const messages = defineMessages({
  // Magic Search
  searchLoading: {
    id: "context.feedback.search.loading",
    defaultMessage: "Searching pictograms...",
    description: "Message shown while searching for pictograms",
  },
  searchComplete: {
    id: "context.feedback.search.complete",
    defaultMessage: "{count} pictograms added",
    description: "Message shown when search is complete",
  },
  searchError: {
    id: "context.feedback.search.error",
    defaultMessage: "Error searching pictograms",
    description: "Message shown when search fails",
  },

  // Apply All
  applyAllSuccess: {
    id: "context.feedback.applyAll.success",
    defaultMessage: "Applied to {count} pictograms",
    description: "Message shown when apply all succeeds",
  },

  // Save/Load
  saveSuccess: {
    id: "context.feedback.save.success",
    defaultMessage: "File saved successfully",
    description: "Message shown when file is saved",
  },
  loadSuccess: {
    id: "context.feedback.load.success",
    defaultMessage: "File loaded successfully",
    description: "Message shown when file is loaded",
  },
  loadError: {
    id: "context.feedback.load.error",
    defaultMessage: "Error loading file",
    description: "Message shown when file load fails",
  },
  loading: {
    id: "context.feedback.loading",
    defaultMessage: "Loading...",
    description: "Generic loading message",
  },
});

export default messages;
