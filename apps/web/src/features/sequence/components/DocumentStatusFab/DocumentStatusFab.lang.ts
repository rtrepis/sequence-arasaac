import { defineMessages } from "react-intl";

// Textos del botó flotant que diu on és la feina de l'usuari.
//
// El vocabulari és deliberat: «desat» a seques no es diu mai de l'esborrany del
// navegador. Qui llegeix «desat» entén que la feina és fora de perill, i
// l'esborrany no ho garanteix — el navegador el pot desallotjar.
const messages = defineMessages({
  fabLabel: {
    id: "features.sequence.status.fabLabel",
    defaultMessage: "On es desa la feina",
    description: "Nom accessible del botó flotant d'estat del document",
  },
  statusPristine: {
    id: "features.sequence.status.pristine",
    defaultMessage: "Encara no hi ha res per desar",
    description: "Estat quan el document és buit",
  },
  statusSaving: {
    id: "features.sequence.status.saving",
    defaultMessage: "Desant en aquest dispositiu…",
    description: "Estat mentre l'esborrany encara no s'ha escrit",
  },
  statusLocal: {
    id: "features.sequence.status.local",
    defaultMessage: "Només en aquest dispositiu, des de les {time}",
    description: "Estat quan la feina només és a l'esborrany del navegador",
  },
  statusFile: {
    id: "features.sequence.status.file",
    defaultMessage: "Descarregat en un fitxer a les {time}",
    description: "Estat quan la feina té còpia en un fitxer .saac",
  },
  statusCloud: {
    id: "features.sequence.status.cloud",
    defaultMessage: "Desat al núvol a les {time}",
    description: "Estat quan la feina té còpia al compte de l'usuari",
  },
  statusError: {
    id: "features.sequence.status.error",
    defaultMessage: "Aquest navegador no ha pogut desar la feina",
    description: "Estat quan l'escriptura de l'esborrany falla",
  },
  hintLocal: {
    id: "features.sequence.status.hintLocal",
    defaultMessage:
      "Es queda en aquest navegador i el pot esborrar sol. Descarrega-ho o desa-ho al núvol per tenir-ho en un altre lloc.",
    description: "Explicació de què vol dir tenir la feina només a l'esborrany",
  },
  hintError: {
    id: "features.sequence.status.hintError",
    defaultMessage:
      "Descarrega el fitxer ara: és l'única manera de no perdre la feina.",
    description: "Explicació quan el navegador no pot desar l'esborrany",
  },
  actionCloud: {
    id: "features.sequence.status.actionCloud",
    defaultMessage: "Desa al núvol",
    description: "Acció del botó flotant: desar el document al compte",
  },
  actionDownload: {
    id: "features.sequence.status.actionDownload",
    defaultMessage: "Descarrega el fitxer",
    description: "Acció del botó flotant: descarregar el document",
  },
  actionNew: {
    id: "features.sequence.status.actionNew",
    defaultMessage: "Document nou",
    description: "Acció del botó flotant: començar un document buit",
  },
  confirmTitle: {
    id: "features.sequence.status.confirmTitle",
    defaultMessage: "Comences un document nou?",
    description: "Títol del diàleg de confirmació abans de buidar el document",
  },
  confirmBody: {
    id: "features.sequence.status.confirmBody",
    defaultMessage:
      "La feina d'ara només és en aquest navegador. Si comences de zero, es perd.",
    description: "Cos del diàleg de confirmació abans de buidar el document",
  },
  confirmCancel: {
    id: "features.sequence.status.confirmCancel",
    defaultMessage: "Cancel·la",
    description: "Botó per no buidar el document",
  },
  confirmDownloadFirst: {
    id: "features.sequence.status.confirmDownloadFirst",
    defaultMessage: "Descarrega-ho abans",
    description: "Botó per desar la feina en un fitxer abans de buidar-la",
  },
  confirmDiscard: {
    id: "features.sequence.status.confirmDiscard",
    defaultMessage: "Comença de zero",
    description: "Botó que buida el document i l'esborrany",
  },
});

export default messages;
