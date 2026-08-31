import { defineMessages } from "react-intl";

const messages = defineMessages({
  storageTitle: {
    id: "features.backend.userSettings.usage.storageTitle",
    defaultMessage: "Espai per a imatges",
    description: "Títol del comptador d'espai ocupat per imatges pròpies",
  },
  documentsTitle: {
    id: "features.backend.userSettings.usage.documentsTitle",
    defaultMessage: "Seqüències al núvol",
    description: "Títol del comptador de documents desats al núvol",
  },
  wordsTitle: {
    id: "features.backend.userSettings.usage.wordsTitle",
    defaultMessage: "Paraules del vocabulari",
    description: "Títol del comptador de paraules del vocabulari personal",
  },
  countOfLimit: {
    id: "features.backend.userSettings.usage.countOfLimit",
    defaultMessage: "{used} de {limit}",
    description: "Consum d'un comptador: quantes de quantes",
  },
  bytesOfLimit: {
    id: "features.backend.userSettings.usage.bytesOfLimit",
    defaultMessage: "{used} de {limit}",
    description: "Espai ocupat: quant de quant",
  },
  megabytes: {
    id: "features.backend.userSettings.usage.megabytes",
    defaultMessage: "{value} MB",
    description: "Pes en megabytes",
  },
  kilobytes: {
    id: "features.backend.userSettings.usage.kilobytes",
    defaultMessage: "{value} KB",
    description: "Pes en kilobytes",
  },
  remainingImages: {
    id: "features.backend.userSettings.usage.remainingImages",
    defaultMessage:
      "{count, plural, =0 {No hi cap cap imatge més amb la qualitat triada} one {Hi cap # imatge més amb la qualitat triada} other {Hi caben # imatges més amb la qualitat triada}}",
    description: "Imatges que encara caben a l'espai que queda",
  },
  imagesTitle: {
    id: "features.backend.userSettings.usage.imagesTitle",
    defaultMessage: "Les teves imatges",
    description: "Títol de la llista d'imatges pròpies del compte",
  },
  imagesEmpty: {
    id: "features.backend.userSettings.usage.imagesEmpty",
    defaultMessage:
      "Encara no has pujat cap imatge pròpia. Els pictogrames d'ARASAAC no ocupen espai del teu compte.",
    description: "Llista d'imatges buida",
  },
  imagesLoadError: {
    id: "features.backend.userSettings.usage.imagesLoadError",
    defaultMessage:
      "No s'han pogut carregar les imatges. Torna-ho a provar d'aquí a una estona.",
    description: "Error en carregar la llista d'imatges",
  },
  reload: {
    id: "features.backend.userSettings.usage.reload",
    defaultMessage: "Torna-ho a provar",
    description: "Botó per tornar a demanar la llista d'imatges",
  },
  inDocument: {
    id: "features.backend.userSettings.usage.inDocument",
    defaultMessage: "A la seqüència «{title}»",
    description: "Origen d'una imatge: el document on es fa servir",
  },
  inUntitledDocument: {
    id: "features.backend.userSettings.usage.inUntitledDocument",
    defaultMessage: "A una seqüència sense nom",
    description: "Origen d'una imatge d'un document que no té títol",
  },
  inWord: {
    id: "features.backend.userSettings.usage.inWord",
    defaultMessage: "A la paraula «{word}»",
    description: "Origen d'una imatge: la paraula del vocabulari",
  },
  deleteImage: {
    id: "features.backend.userSettings.usage.deleteImage",
    defaultMessage: "Esborra la imatge",
    description: "Botó per esborrar una imatge del compte",
  },
  deleteTitle: {
    id: "features.backend.userSettings.usage.deleteTitle",
    defaultMessage: "Esborres la imatge?",
    description: "Títol de la confirmació d'esborrar una imatge",
  },
  deleteBodyDocument: {
    id: "features.backend.userSettings.usage.deleteBodyDocument",
    defaultMessage:
      "El pictograma es quedarà sense imatge a la seqüència desada al núvol, i recuperaràs {size}. La imatge no es pot recuperar.",
    description: "Què es perd en esborrar la imatge d'un document",
  },
  deleteBodyWord: {
    id: "features.backend.userSettings.usage.deleteBodyWord",
    defaultMessage:
      "La paraula es quedarà amb el seu pictograma d'ARASAAC, i recuperaràs {size}. La imatge no es pot recuperar.",
    description: "Què es perd en esborrar la imatge d'una paraula",
  },
  deleteConfirm: {
    id: "features.backend.userSettings.usage.deleteConfirm",
    defaultMessage: "Esborra la imatge",
    description: "Botó que confirma l'esborrat de la imatge",
  },
  deleted: {
    id: "features.backend.userSettings.usage.deleted",
    defaultMessage: "Imatge esborrada. Has recuperat {size}.",
    description: "Confirmació d'esborrat amb l'espai recuperat",
  },
  deleteError: {
    id: "features.backend.userSettings.usage.deleteError",
    defaultMessage: "No s'ha pogut esborrar la imatge. (Codi: {code})",
    description: "Error en esborrar una imatge",
  },
  thumbnailAlt: {
    id: "features.backend.userSettings.usage.thumbnailAlt",
    defaultMessage: "Imatge pujada",
    description: "Text alternatiu de la miniatura d'una imatge del compte",
  },
});

export default messages;
