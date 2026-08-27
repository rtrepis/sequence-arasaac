import { defineMessages } from "react-intl";

const messages = defineMessages({
  modal: {
    id: "components.pictEdit.modal.label",
    defaultMessage: "Edit Pictogram",
    description: "Title modal",
  },
  description: {
    id: "components.pictEdit.modal.description",
    defaultMessage: "You can edit pictogram",
    description: "Description modal",
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
