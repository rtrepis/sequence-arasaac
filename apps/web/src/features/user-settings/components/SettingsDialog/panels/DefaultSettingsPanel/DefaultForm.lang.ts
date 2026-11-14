import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelHint: {
    id: "components.defaultSettings.panelHint",
    defaultMessage:
      "L'estil dels pictogrames amb què neixen els documents nous. Per portar-lo a un document obert, fes servir «Aplica el meu estil» al menú «⋯» d'una pàgina o d'un bloc.",
    description:
      "Ajuda del panell «El meu estil»: és una preferència de l'usuari, no l'estil del document obert, i al document s'hi porta des del menú «⋯» de la vista",
  },
  pictGuide: {
    id: "components.defaultSettings.pictGuide",
    defaultMessage: "Preview",
    description: "Paraula del pictograma de mostra dels settings per defecte",
  },
  sectionPictogram: {
    id: "components.defaultSettings.sectionPictogram",
    defaultMessage: "Pictogram",
    description:
      "Títol de la secció de numeració i color al panell de pictogrames",
  },
  sectionText: {
    id: "components.defaultSettings.sectionText",
    defaultMessage: "Text and numbering",
    description:
      "Títol de la secció de posició de text i tipografies al panell de pictogrames",
  },
  sectionAppearance: {
    id: "components.defaultSettings.sectionAppearance",
    defaultMessage: "Appearance",
    description: "Títol de la secció de pell i cabell al panell de pictogrames",
  },
  reset: {
    id: "components.defaultSettings.reset",
    defaultMessage: "Restore pictograms",
    description:
      "Botó per restablir els valors de fàbrica de la configuració de pictogrames",
  },
  tooltipReset: {
    id: "components.defaultSettings.tooltipReset",
    defaultMessage: "Return pictogram settings to factory values",
    description: "Tooltip del botó de restaurar la configuració de pictogrames",
  },
  myStyleTitle: {
    id: "components.defaultSettings.myStyle.title",
    defaultMessage: "El meu estil",
    description:
      "Títol del panell «El meu estil» de la configuració: l'estil dels pictogrames de l'usuari",
  },
  loadStyleFile: {
    id: "components.defaultSettings.myStyle.loadFile",
    defaultMessage: "Carrega un estil des d'un fitxer…",
    description:
      "Acció del panell «El meu estil»: l'estil d'un fitxer .saacstyle (o d'un document .saac) passa a ser el meu estil",
  },
  saveStyleFile: {
    id: "components.defaultSettings.myStyle.saveFile",
    defaultMessage: "Desa el meu estil en un fitxer…",
    description:
      "Acció del panell «El meu estil»: desa el meu estil en un fitxer .saacstyle",
  },
  styleActions: {
    id: "components.defaultSettings.myStyle.actions",
    defaultMessage: "Accions del meu estil",
    description:
      "Nom accessible del botó «⋯» que obre el menú amb les accions del panell «El meu estil» al mòbil",
  },
});

export default messages;
