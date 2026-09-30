import { defineMessages } from "react-intl";

const messages = defineMessages({
  cardName: {
    id: "components.pictEdit.cardName",
    defaultMessage: "{text}, pictograma {number}",
    description:
      "Nom accessible d'una targeta de la graella d'edició: el text i el número",
  },
  cardNameNoText: {
    id: "components.pictEdit.cardNameNoText",
    defaultMessage: "Pictograma {number}",
    description:
      "Nom accessible d'una targeta de la graella que encara no té paraula",
  },
  cardNameCustomized: {
    id: "components.pictEdit.cardNameCustomized",
    defaultMessage: "{name}, personalitzat",
    description:
      "Nom accessible d'una targeta amb retocs propis: el nom i «personalitzat»",
  },
  modal: {
    id: "components.pictEdit.modal.label",
    defaultMessage: "Edit Pictogram",
    description: "Title modal",
  },
  moreActions: {
    id: "components.pictEdit.moreActions",
    defaultMessage: "More actions",
    description:
      "Obre el menú d'accions del pictograma des del diàleg d'edició",
  },
  close: {
    id: "components.pictEdit.close",
    defaultMessage: "Close",
    description: "Close modal, edit pictogram",
  },
  delete: {
    id: "components.pictEdit.delete",
    defaultMessage: "Delete",
    description: "Delete modal, edit pictogram",
  },
});

export default messages;
