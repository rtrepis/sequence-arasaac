import { defineMessages } from "react-intl";

const messages = defineMessages({
  field: {
    id: "components.magicSearch.label",
    defaultMessage: "Magic Search",
    description: "label text field",
  },
  helperText: {
    id: "components.magicSearch.helperText.",
    defaultMessage:
      "Type the words in the sequence between the commas and press Return or click the magnifying glass when you're done. Example: boy, put, seat belt.",
    description: "Helper text field",
  },
  button: {
    id: "components.magicSearch.button.",
    defaultMessage: "To search",
    description: "label button field",
  },
});

export default messages;
