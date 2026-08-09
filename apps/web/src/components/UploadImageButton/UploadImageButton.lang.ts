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
  errorLoading: {
    id: "components.uploadImageButton.errorLoading",
    defaultMessage: "The image could not be loaded",
    description: "Error genèric en carregar la imatge",
  },
});

export default messages;
