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
  centimeters: {
    id: "features.backend.userSettings.usage.centimeters",
    defaultMessage: "{value} cm",
    description: "Mida impresa en centímetres",
  },
  sizeWithPrint: {
    id: "features.backend.userSettings.usage.sizeWithPrint",
    defaultMessage: "{size} · es veu bé fins a {width}",
    description: "Pes d'una imatge i mida fins a la qual s'imprimeix nítida",
  },
  resizeImage: {
    id: "features.backend.userSettings.usage.resizeImage",
    defaultMessage: "Canvia la mida de la imatge",
    description: "Botó per reduir una imatge del compte",
  },
  resizeTitle: {
    id: "features.backend.userSettings.usage.resizeTitle",
    defaultMessage: "Canvia la mida de la imatge",
    description: "Títol del diàleg per reduir una imatge",
  },
  resizeCurrent: {
    id: "features.backend.userSettings.usage.resizeCurrent",
    defaultMessage:
      "Ara ocupa {size} i es veu bé impresa fins a {width} d'ample. El pictograma no canvia: només la mida de la imatge.",
    description: "Estat actual de la imatge dins del diàleg de canvi de mida",
  },
  resizeCurrentUnknown: {
    id: "features.backend.userSettings.usage.resizeCurrentUnknown",
    defaultMessage:
      "Ara ocupa {size}. El pictograma no canvia: només la mida de la imatge.",
    description:
      "Estat actual de la imatge quan encara no se'n saben els píxels",
  },
  resizePreparing: {
    id: "features.backend.userSettings.usage.resizePreparing",
    defaultMessage: "S'estan preparant les mides…",
    description: "Espera mentre es calculen les versions més petites",
  },
  resizeOption: {
    id: "features.backend.userSettings.usage.resizeOption",
    defaultMessage:
      "Es veurà bé fins a {width} d'ample i ocuparà {size}: recuperes {saved}.",
    description: "Què passa amb la mida triada al diàleg de canvi de mida",
  },
  resizeNone: {
    id: "features.backend.userSettings.usage.resizeNone",
    defaultMessage:
      "Aquesta imatge ja és a la mida més petita: reduir-la més la faria borrosa impresa. Si necessites espai, esborra-la.",
    description: "La imatge no es pot reduir més",
  },
  resizeConfirm: {
    id: "features.backend.userSettings.usage.resizeConfirm",
    defaultMessage: "Canvia la mida",
    description: "Botó que aplica la mida triada",
  },
  resizeCancel: {
    id: "features.backend.userSettings.usage.resizeCancel",
    defaultMessage: "Cancel·la",
    description: "Botó que tanca el diàleg de canvi de mida sense fer res",
  },
  resizeApplying: {
    id: "features.backend.userSettings.usage.resizeApplying",
    defaultMessage: "S'està canviant la mida de la imatge…",
    description: "Espera mentre la imatge nova puja al núvol",
  },
  resizeLoadError: {
    id: "features.backend.userSettings.usage.resizeLoadError",
    defaultMessage:
      "No s'ha pogut preparar la imatge. Comprova la connexió i torna-ho a provar.",
    description: "Error en baixar o comprimir la imatge al navegador",
  },
  resizeError: {
    id: "features.backend.userSettings.usage.resizeError",
    defaultMessage: "No s'ha pogut canviar la mida de la imatge. (Codi: {code})",
    description: "Error en desar la imatge reduïda",
  },
  resized: {
    id: "features.backend.userSettings.usage.resized",
    defaultMessage: "La imatge ara ocupa {size}. Has recuperat {saved}.",
    description: "Confirmació del canvi de mida amb l'espai recuperat",
  },
  thumbnailAlt: {
    id: "features.backend.userSettings.usage.thumbnailAlt",
    defaultMessage: "Imatge pujada",
    description: "Text alternatiu de la miniatura d'una imatge del compte",
  },
});

export default messages;
