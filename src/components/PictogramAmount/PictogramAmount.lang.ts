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
    defaultMessage:
      "Insert or extract a pictogram at the end of the sequence. You will find more functions with the right mouse button or long press on mobiles.",
    description: "Helper text amount pictograms",
  },
});

export default messages;
