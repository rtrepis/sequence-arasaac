import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "features.wordProfile.list.title",
    defaultMessage: "My words ({count})",
    description: "Títol de la llista de paraules del vocabulari personal",
  },
  empty: {
    id: "features.wordProfile.list.empty",
    defaultMessage: "No words yet. Use the form to add your first one.",
    description: "Missatge quan encara no hi ha cap paraula desada",
  },
  editLabel: {
    id: "features.wordProfile.list.editLabel",
    defaultMessage: "Edit {word}",
    description: "Etiqueta accessible del botó que obre una paraula per editar-la",
  },
  deleteLabel: {
    id: "features.wordProfile.list.deleteLabel",
    defaultMessage: "Delete {word}",
    description: "Etiqueta accessible del botó que esborra una paraula",
  },
  editingBadge: {
    id: "features.wordProfile.list.editingBadge",
    defaultMessage: "Editing",
    description: "Marca de la paraula que s'està editant ara mateix",
  },
});

export default messages;
