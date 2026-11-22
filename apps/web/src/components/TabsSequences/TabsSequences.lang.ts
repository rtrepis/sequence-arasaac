import { defineMessages } from "react-intl";

// Tooltips i noms accessibles dels controls de seqüències (afegir una seqüència)
const messages = defineMessages({
  addSequence: {
    id: "components.tabsSequences.addSequence",
    defaultMessage: "Add sequence",
    description: "Tooltip del botó que afegeix una seqüència nova",
  },
  sequenceNumber: {
    id: "components.tabsSequences.sequenceNumber",
    defaultMessage: "Sequence number",
    description: "Nom accessible de la llista de tabs de seqüències",
  },
});

export default messages;
