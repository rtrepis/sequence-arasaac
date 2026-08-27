import { defineMessages } from "react-intl";

// Tooltips i noms accessibles dels controls de seqüències (afegir/eliminar pàgina)
const messages = defineMessages({
  addSequence: {
    id: "components.tabsSequences.addSequence",
    defaultMessage: "Add sequence",
    description: "Tooltip del botó que afegeix una seqüència nova",
  },
  deleteLastSequence: {
    id: "components.tabsSequences.deleteLastSequence",
    defaultMessage: "Delete last sequence",
    description: "Tooltip del botó que elimina l'última seqüència",
  },
  confirmDeleteTitle: {
    id: "components.tabsSequences.confirmDeleteTitle",
    defaultMessage: "Delete sequence {number}?",
    description: "Títol de la confirmació d'esborrar l'última seqüència",
  },
  confirmDeleteBody: {
    id: "components.tabsSequences.confirmDeleteBody",
    defaultMessage:
      "It has {count, plural, one {# pictogram} other {# pictograms}}. Deleting the sequence takes them all with it and it cannot be undone.",
    description: "Cos de la confirmació: què es perd en esborrar la seqüència",
  },
  confirmDelete: {
    id: "components.tabsSequences.confirmDelete",
    defaultMessage: "Delete sequence",
    description: "Botó que confirma l'esborrat de l'última seqüència",
  },
  sequenceNumber: {
    id: "components.tabsSequences.sequenceNumber",
    defaultMessage: "Sequence number",
    description: "Nom accessible de la llista de tabs de seqüències",
  },
});

export default messages;
