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
  textOverflowMark: {
    id: "components.pictEdit.textOverflow.mark",
    defaultMessage: "Pictograma {number}: el text no hi cap",
    description:
      "Nom accessible de la marca d'avís de la graella quan el text de la targeta es talla. Obre les opcions",
  },
  textOverflowTooltip: {
    id: "components.pictEdit.textOverflow.tooltip",
    defaultMessage:
      "El text no hi cap i es talla. Clica per veure què pots fer.",
    description:
      "Tooltip de la marca d'avís quan el text de la targeta es talla",
  },
  textOverflowTitle: {
    id: "components.pictEdit.textOverflow.title",
    defaultMessage: "El text no hi cap",
    description:
      "Títol del quadre d'opcions quan el text de la targeta es talla",
  },
  textOverflowExplanation: {
    id: "components.pictEdit.textOverflow.explanation",
    defaultMessage:
      "Una paraula és massa llarga per a l'amplada de la targeta i se'n talla un tros. Sortirà tallada també en imprimir i al PDF.",
    description:
      "Explicació del quadre d'opcions quan el text de la targeta es talla",
  },
  textOverflowTooLong: {
    id: "components.pictEdit.textOverflow.tooLong",
    defaultMessage:
      "Ni amb la lletra més petita no hi cap: cal escurçar el text.",
    description:
      "Quadre d'opcions del text tallat, quan cap mida de lletra no el fa cabre",
  },
  textOverflowFitDocument: {
    id: "components.pictEdit.textOverflow.fitDocument",
    defaultMessage: "Redueix la lletra de tot el document a {size}",
    description:
      "Opció del text tallat: redueix la mida de la lletra de l'estil del document, i totes les targetes la mantenen igual. {size} és la mida nova (p. ex. 0,8)",
  },
  textOverflowFitPictogram: {
    id: "components.pictEdit.textOverflow.fitPictogram",
    defaultMessage: "Redueix la lletra només d'aquest pictograma a {size}",
    description:
      "Opció del text tallat: redueix la mida de la lletra només d'aquesta targeta. {size} és la mida nova (p. ex. 0,8)",
  },
  textOverflowEditText: {
    id: "components.pictEdit.textOverflow.editText",
    defaultMessage: "Edita el text",
    description:
      "Opció del text tallat: obre l'edició del text damunt de la targeta",
  },
  cardTextInput: {
    id: "components.pictEdit.cardTextInput",
    defaultMessage: "Text of pictogram {number}",
    description:
      "Nom accessible del camp que edita el text damunt de la targeta de la graella",
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
