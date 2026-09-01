import { defineMessages } from "react-intl";

const messages = defineMessages({
  upload: {
    id: "components.uploadImageButton.upload",
    defaultMessage: "Upload your own image",
    description: "Botó per pujar una imatge pròpia des del dispositiu",
  },
  replace: {
    id: "components.uploadImageButton.replace",
    defaultMessage: "Change the uploaded image",
    description: "Mateix botó quan ja hi ha una imatge pujada",
  },
  remove: {
    id: "components.uploadImageButton.remove",
    defaultMessage: "Remove the uploaded image",
    description: "Botó per treure la imatge pujada",
  },
  loading: {
    id: "components.uploadImageButton.loading",
    defaultMessage: "Processing the image…",
    description: "Estat mentre la imatge es converteix i es comprimeix",
  },
  uploaded: {
    id: "components.uploadImageButton.uploaded",
    defaultMessage: "Image added",
    description: "Confirmació que la imatge s'ha afegit",
  },
  removed: {
    id: "components.uploadImageButton.removed",
    defaultMessage: "Image removed",
    description: "Confirmació que la imatge s'ha tret",
  },
  errorNotImage: {
    id: "components.uploadImageButton.errorNotImage",
    defaultMessage: "The file is not an image",
    description: "Error quan el fitxer triat no és una imatge",
  },
  print: {
    id: "components.uploadImageButton.print",
    defaultMessage: "print",
    description: "Nom del nivell de qualitat dins d'una frase",
  },
  standard: {
    id: "components.uploadImageButton.standard",
    defaultMessage: "standard",
    description: "Nom del nivell de qualitat dins d'una frase",
  },
  compact: {
    id: "components.uploadImageButton.compact",
    defaultMessage: "compact",
    description: "Nom del nivell de qualitat dins d'una frase",
  },
  tooBigTitle: {
    id: "components.uploadImageButton.tooBigTitle",
    defaultMessage: "The image takes up too much space",
    description: "Títol del diàleg d'una imatge que no cap",
  },
  tooBigQuotaSmaller: {
    id: "components.uploadImageButton.tooBigQuotaSmaller",
    defaultMessage:
      "The image takes up {size} and only {available} are left in your account. With {quality} quality it would take up {smallerSize} and would still print well up to {smallerWidth} wide, so it would fit.",
    description: "No cap a l'espai del compte, però n'hi ha una de més petita",
  },
  tooBigQuotaOnly: {
    id: "components.uploadImageButton.tooBigQuotaOnly",
    defaultMessage:
      "The image takes up {size} and only {available} are left in your account. It does not fit at any quality: you can still add it and print it from this device, but you will need to free up space to save it to the cloud.",
    description:
      "No cap a l'espai del compte i no hi ha cap versió que hi càpiga",
  },
  tooBigPerImageSmaller: {
    id: "components.uploadImageButton.tooBigPerImageSmaller",
    defaultMessage:
      "The image takes up {size} and the maximum per image is {available}. With {quality} quality it would take up {smallerSize} and would still print well up to {smallerWidth} wide.",
    description: "Passa del sostre per imatge, però n'hi ha una de més petita",
  },
  tooBigPerImageOnly: {
    id: "components.uploadImageButton.tooBigPerImageOnly",
    defaultMessage:
      "The image takes up {size} and the maximum per image is {available}. You can still add it and print it from this device, but it cannot be saved to the cloud.",
    description: "Passa del sostre per imatge i no hi ha cap versió més petita",
  },
  useSmaller: {
    id: "components.uploadImageButton.useSmaller",
    defaultMessage: "Make it smaller",
    description: "Botó que posa la versió reduïda de la imatge",
  },
  useOriginal: {
    id: "components.uploadImageButton.useOriginal",
    defaultMessage: "Add it anyway",
    description: "Botó que posa la imatge tal com és",
  },
  cancelUpload: {
    id: "components.uploadImageButton.cancelUpload",
    defaultMessage: "Cancel",
    description: "Botó que descarta la imatge triada",
  },
  errorLoading: {
    id: "components.uploadImageButton.errorLoading",
    defaultMessage: "The image could not be loaded",
    description: "Error genèric en carregar la imatge",
  },
});

export default messages;
