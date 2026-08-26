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
  sequenceNumber: {
    id: "components.tabsSequences.sequenceNumber",
    defaultMessage: "Sequence number",
    description: "Nom accessible de la llista de tabs de seqüències",
  },
});

export default messages;
