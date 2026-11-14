import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelDescription: {
    id: "components.viewSettingsPanel.panelDescription",
    defaultMessage:
      "The page and pictogram arrangement that new documents start with.",
    description:
      "Text explicatiu del panell «Vista» de la configuració: aquests valors només els agafen els documents nous",
  },
  sectionPageFormat: {
    id: "components.viewSettingsPanel.sectionPageFormat",
    defaultMessage: "Page format",
    description: "Títol de la secció de format de pàgina al panell de vista",
  },
  sectionPictograms: {
    id: "components.viewSettingsPanel.sectionPictograms",
    defaultMessage: "Pictogram arrangement",
    description:
      "Títol de la secció de mida i alineació de pictogrames al panell de vista",
  },
  reset: {
    id: "components.viewSettingsPanel.reset",
    defaultMessage: "Restore view",
    description:
      "Botó per restablir els valors de fàbrica de la configuració de vista",
  },
  tooltipReset: {
    id: "components.viewSettingsPanel.tooltipReset",
    defaultMessage: "Return view settings to factory values",
    description: "Tooltip del botó de restaurar la configuració de vista",
  },
  dispositionHelp: {
    id: "components.viewSettingsPanel.dispositionHelp",
    defaultMessage:
      "How the first page of a new document starts, and the pages you add to it.",
    description:
      "Ajuda sota la fila «Disposició» del panell «Pàgina i distribució»: és la disposició (simple, columnes, files o lliure) de la primera pàgina dels documents nous i de les pàgines que s'hi afegeixen",
  },
  previewSequences: {
    id: "components.viewSettingsPanel.previewSequences",
    defaultMessage: "Sequences in the preview",
    description:
      "Nom accessible del grup de caselles, sota la mostra del panell «Pàgina i distribució», que mostren o amaguen cadascuna de les tres seqüències de la mostra (no es desa)",
  },
});

export default messages;
