import { defineMessages } from "react-intl";

const messages = defineMessages({
  search: {
    id: "components.pictogramSearch.label",
    defaultMessage: "Search",
    description: "search pictograms",
  },
  helperText: {
    id: "components.pictogramSearch.helperText",
    defaultMessage: "Pictogram search engine",
    description: "helper text",
  },
  pictogram: {
    id: "components.pictogramSearch.pictogram",
    defaultMessage: "Pictogram",
    description: "Pictogram",
  },
  alert: {
    id: "components.pictogramSearch.alert",
    defaultMessage: "No pictogram found with this word - Try another word!",
    description: "Search pictogram not founded results",
  },
});

export default messages;
