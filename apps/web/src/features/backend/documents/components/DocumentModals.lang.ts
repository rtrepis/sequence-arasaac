import { defineMessages } from "react-intl";

// Traduccions dels diàlegs de document al núvol (desar amb nom i carregar).
// Els codis d'error i els ítems del drawer segueixen vivint a AuthModal.lang.
const messages = defineMessages({
  saveTitle: {
    id: "features.backend.documents.saveTitle",
    defaultMessage: "Desa al núvol",
    description: "Títol del diàleg per desar un document nou al núvol",
  },
  updateTitle: {
    id: "features.backend.documents.updateTitle",
    defaultMessage: "Actualitza al núvol",
    description:
      "Títol del diàleg quan el document ja existeix al núvol i se'n desa una versió nova",
  },
  nameLabel: {
    id: "features.backend.documents.nameLabel",
    defaultMessage: "Nom del document",
    description: "Etiqueta del camp de nom del document",
  },
  nameHelper: {
    id: "features.backend.documents.nameHelper",
    defaultMessage:
      "És el nom amb què el retrobaràs quan el tornis a carregar.",
    description: "Text d'ajuda del camp de nom del document",
  },
  nameRequired: {
    id: "features.backend.documents.nameRequired",
    defaultMessage: "Posa-li un nom per poder-lo retrobar.",
    description: "Validació: el nom del document és obligatori",
  },
  updateHint: {
    id: "features.backend.documents.updateHint",
    defaultMessage:
      "Aquest document ja és al núvol: desar-lo en substituirà la versió desada.",
    description: "Avís del diàleg quan el document ja existeix al núvol",
  },
  saveAction: {
    id: "features.backend.documents.saveAction",
    defaultMessage: "Desa",
    description: "Botó per desar el document al núvol",
  },
  updateAction: {
    id: "features.backend.documents.updateAction",
    defaultMessage: "Actualitza",
    description: "Botó per actualitzar el document ja desat al núvol",
  },
  cancel: {
    id: "features.backend.documents.cancel",
    defaultMessage: "Cancel·la",
    description: "Botó per tancar el diàleg sense desar",
  },
  uploading: {
    id: "features.backend.documents.uploading",
    defaultMessage: "Enviant la seqüència… {percent}%",
    description: "Progrés de la pujada del document al núvol",
  },
  uploadingUnknown: {
    id: "features.backend.documents.uploadingUnknown",
    defaultMessage: "Enviant la seqüència…",
    description: "Progrés de la pujada quan no se'n sap la mida total",
  },
  downloading: {
    id: "features.backend.documents.downloading",
    defaultMessage: "Rebent el document… {percent}%",
    description: "Progrés de la baixada d'un document del núvol",
  },
  downloadingUnknown: {
    id: "features.backend.documents.downloadingUnknown",
    defaultMessage: "Rebent el document…",
    description: "Progrés de la baixada quan no se'n sap la mida total",
  },
  documentSavedNamed: {
    id: "features.backend.documents.documentSavedNamed",
    defaultMessage: "«{title}» s'ha desat al núvol",
    description: "Confirmació en desar un document amb nom",
  },
  documentLoadedNamed: {
    id: "features.backend.documents.documentLoadedNamed",
    defaultMessage: "«{title}» s'ha carregat",
    description: "Confirmació en carregar un document amb nom",
  },
  documentDeleted: {
    id: "features.backend.documents.documentDeleted",
    defaultMessage: "Document esborrat del núvol",
    description: "Confirmació en esborrar un document del núvol",
  },
  deleteError: {
    id: "features.backend.documents.deleteError",
    defaultMessage: "No s'ha pogut esborrar el document. Torna-ho a provar.",
    description: "Error en esborrar un document del núvol",
  },
  untitled: {
    id: "features.backend.documents.untitled",
    defaultMessage: "Sense nom",
    description: "Nom que es mostra per a un document desat sense títol",
  },
  thumbnailLabel: {
    id: "features.backend.documents.thumbnailLabel",
    defaultMessage: "Primers pictogrames de «{title}»",
    description: "Text alternatiu de la miniatura d'un document del llistat",
  },
});

export default messages;
