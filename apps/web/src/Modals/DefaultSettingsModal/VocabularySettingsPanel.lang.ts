import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "components.defaultSettings.vocabularyPanel.title",
    defaultMessage: "Personal vocabulary",
    description: "Títol del panel de vocabulari personal",
  },
  sectionWord: {
    id: "components.defaultSettings.vocabularyPanel.sectionWord",
    defaultMessage: "Word",
    description: "Títol de la secció de paraula i llista del panell de vocabulari",
  },
  sectionPictogram: {
    id: "components.defaultSettings.vocabularyPanel.sectionPictogram",
    defaultMessage: "Pictogram",
    description: "Títol de la secció de cerca i aparença del pictograma al panell de vocabulari",
  },
  wordInputLabel: {
    id: "components.defaultSettings.vocabularyPanel.wordInputLabel",
    defaultMessage: "Word",
    description: "Etiqueta del camp de text per introduir una paraula",
  },
  wordInputPlaceholder: {
    id: "components.defaultSettings.vocabularyPanel.wordInputPlaceholder",
    defaultMessage: "e.g. Oscar, Marta...",
    description: "Placeholder del camp de text per introduir una paraula",
  },
  addButton: {
    id: "components.defaultSettings.vocabularyPanel.addButton",
    defaultMessage: "Add",
    description: "Botó per afegir una paraula al vocabulari personal",
  },
  emptyList: {
    id: "components.defaultSettings.vocabularyPanel.emptyList",
    defaultMessage: "No words yet. Add a word to get started.",
    description: "Missatge quan la llista de paraules és buida",
  },
  previewLabel: {
    id: "components.defaultSettings.vocabularyPanel.previewLabel",
    defaultMessage: "Preview",
    description: "Etiqueta de la previsualització del pictograma",
  },
  duplicateWarning: {
    id: "components.defaultSettings.vocabularyPanel.duplicateWarning",
    defaultMessage: "This word already exists and will be updated.",
    description: "Avís quan la paraula ja existeix i s'actualitzarà",
  },
  updateButton: {
    id: "components.defaultSettings.vocabularyPanel.updateButton",
    defaultMessage: "Update",
    description: "Botó per actualitzar una paraula existent",
  },
  uploadImage: {
    id: "components.defaultSettings.vocabularyPanel.uploadImage",
    defaultMessage: "Upload image",
    description: "Botó per pujar una imatge personalitzada per a la paraula",
  },
  removeImage: {
    id: "components.defaultSettings.vocabularyPanel.removeImage",
    defaultMessage: "Remove image",
    description: "Botó per eliminar la imatge personalitzada",
  },
  loginRequired: {
    id: "components.defaultSettings.vocabularyPanel.loginRequired",
    defaultMessage: "You need to log in to use personal vocabulary.",
    description: "Missatge quan l'usuari no està autenticat",
  },
  freeLimitReached: {
    id: "components.defaultSettings.vocabularyPanel.freeLimitReached",
    defaultMessage: "You have reached the limit of {max} words for the free plan.",
    description: "Missatge quan l'usuari free arriba al límit de paraules",
  },
});

export default messages;
