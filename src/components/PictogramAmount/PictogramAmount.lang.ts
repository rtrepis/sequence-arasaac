import { defineMessages } from "react-intl";

const messages = defineMessages({
  amount: {
    id: "components.pictogramAmount",
    defaultMessage: "Pictograms:",
    description: "Amount Pictogram",
  },
  add: {
    id: "components.pictogramAmount.add.label",
    defaultMessage: "Add pictogram",
    description: "Add a pictogram to the amounts",
  },
  subtract: {
    id: "components.pictogramAmount.Subtract.label",
    defaultMessage: "Subtract pictogram",
    description: "Subtract a pictogram from the amounts",
  },
  helperText: {
    id: "components.pictogramAmount.helperText",
    defaultMessage: "Enter the number of pictograms in the sequence.",
    description: "Helper text amount pictograms",
  },
  empty: {
    id: "components.pictogramAmount.empty",
    defaultMessage: "Empty",
    description: "Empty pictogram",
  },
});

export default messages;
