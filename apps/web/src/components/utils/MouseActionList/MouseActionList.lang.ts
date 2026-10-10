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
  pasteEmpty: {
    id: "components.mouseActionList.pasteEmpty",
    defaultMessage: "Copia abans un pictograma",
    description:
      "Sota «Enganxa», quan no s'ha copiat res: per què encara no es pot enganxar",
  },
  pasteSource: {
    id: "components.mouseActionList.pasteSource",
    defaultMessage: "Copiat: «{text}»",
    description:
      "Sota «Enganxa»: quin pictograma hi ha copiat, pel seu text. {text} és la paraula",
  },
  pasteSourceNoText: {
    id: "components.mouseActionList.pasteSourceNoText",
    defaultMessage: "Copiat: un pictograma sense text",
    description:
      "Sota «Enganxa», quan el pictograma copiat no té paraula ni text",
  },
  edit: {
    id: "components.mouseActionList.edit",
    defaultMessage: "Edit",
    description: "Obre el diàleg d'edició del pictograma",
  },
  editText: {
    id: "components.mouseActionList.editText",
    defaultMessage: "Edit text",
    description:
      "Canvia el text del pictograma directament damunt de la targeta, sense obrir el diàleg",
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
  resetStyle: {
    id: "components.mouseActionList.resetStyle",
    defaultMessage: "Restableix l'estil",
    description:
      "Treu els retocs d'estil del pictograma: torna a l'estil del document (es pot desfer)",
  },
  duplicate: {
    id: "components.mouseActionList.duplicate",
    defaultMessage: "Duplicate after this",
    description:
      "Insereix una còpia del pictograma just després del pictograma actual",
  },
});

export default messages;
