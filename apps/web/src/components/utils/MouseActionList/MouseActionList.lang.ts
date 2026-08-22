import { defineMessages } from "react-intl";

const messages = defineMessages({
  header: {
    id: "components.mouseActionList.header",
    defaultMessage: "Pictogram {number}",
    description:
      "Capçalera del menú contextual: quin pictograma s'està editant",
  },
  copy: {
    id: "components.mouseActionList.copy",
    defaultMessage: "Copy",
    description: "Desa el pictograma al porta-retalls intern de la seqüència",
  },
  paste: {
    id: "components.mouseActionList.paste",
    defaultMessage: "Paste (replaces)",
    description:
      "Substitueix el pictograma actual pel que hi ha al porta-retalls",
  },
  edit: {
    id: "components.mouseActionList.edit",
    defaultMessage: "Edit",
    description: "Obre el diàleg d'edició del pictograma",
  },
  delete: {
    id: "components.mouseActionList.delete",
    defaultMessage: "Delete",
    description: "Treu el pictograma de la seqüència",
  },
  insert: {
    id: "components.mouseActionList.insert",
    defaultMessage: "Insert empty after this",
    description:
      "Insereix un pictograma buit just després del pictograma actual",
  },
  duplicate: {
    id: "components.mouseActionList.duplicate",
    defaultMessage: "Duplicate after this",
    description:
      "Insereix una còpia del pictograma just després del pictograma actual",
  },
});

export default messages;
