import { defineMessages } from "react-intl";

// Textos de la capçalera de la seqüència oberta a l'edició i del seu menú «⋯»
// (pla dels estils, pas 5)
const messages = defineMessages({
  styleLabel: {
    id: "features.sequence.header.styleLabel",
    defaultMessage: "Estil: {name}",
    description:
      "L'estil de la seqüència oberta, a l'edició: el nom de l'estil, o «Personalitzat» si algun pictograma té retocs",
  },
  customized: {
    id: "features.sequence.header.customized",
    defaultMessage: "Personalitzat",
    description:
      "En lloc del nom de l'estil, quan algun pictograma de la seqüència té retocs propis",
  },
  customizedHelp: {
    id: "features.sequence.header.customizedHelp",
    defaultMessage:
      "L'estil de base és «{name}». {count, plural, one {# pictograma té retocs propis.} other {# pictogrames tenen retocs propis.}}",
    description:
      "Ajuda (tooltip i nom accessible) al costat de «Personalitzat»: quin és l'estil de base i quants pictogrames tenen retocs",
  },
  sequenceActions: {
    id: "features.sequence.header.sequenceActions",
    defaultMessage: "Accions de «{name}»",
    description:
      "Nom accessible i tooltip del botó «⋯» de la seqüència oberta, a l'edició",
  },
  changeStyle: {
    id: "features.sequence.header.changeStyle",
    defaultMessage: "Estil: {name} — Canvia…",
    description:
      "Primera acció del menú «⋯» de la seqüència: diu l'estil i obre la Galeria d'estils",
  },
  rename: {
    id: "features.sequence.header.rename",
    defaultMessage: "Canvia el nom",
    description:
      "Acció que canvia el nom de la seqüència (menú «⋯» i llapis al costat del nom), i títol del diàleg",
  },
  renameHelp: {
    id: "features.sequence.header.renameHelp",
    defaultMessage:
      "El nom és per a tu: no s'imprimeix. Si el deixes buit, es dirà «Seqüència {number}».",
    description: "Ajuda del diàleg «Canvia el nom» d'una seqüència",
  },
  nameField: {
    id: "features.sequence.header.nameField",
    defaultMessage: "Nom de la seqüència",
    description: "Etiqueta del camp del diàleg «Canvia el nom»",
  },
  renameSave: {
    id: "features.sequence.header.renameSave",
    defaultMessage: "Desa el nom",
    description: "Botó principal del diàleg «Canvia el nom»",
  },
  renamed: {
    id: "features.sequence.header.renamed",
    defaultMessage: "S'ha canviat el nom de la seqüència.",
    description: "Confirmació després de canviar el nom d'una seqüència",
  },
  resetPictograms: {
    id: "features.sequence.header.resetPictograms",
    defaultMessage: "Restableix els pictogrames",
    description:
      "Acció del menú «⋯» de la seqüència: treu els retocs de tots els seus pictogrames (es pot desfer)",
  },
  remove: {
    id: "features.sequence.header.remove",
    defaultMessage: "Treu aquesta seqüència",
    description:
      "Acció del menú «⋯» de la seqüència: treu la seqüència oberta del document",
  },
  removed: {
    id: "features.sequence.header.removed",
    defaultMessage: "S'ha tret «{name}».",
    description: "Confirmació després de treure una seqüència del document",
  },
  confirmRemoveTitle: {
    id: "features.sequence.header.confirmRemoveTitle",
    defaultMessage: "Vols treure «{name}»?",
    description: "Títol de la confirmació de treure una seqüència",
  },
  confirmRemoveBody: {
    id: "features.sequence.header.confirmRemoveBody",
    defaultMessage:
      "Té {count, plural, one {# pictograma} other {# pictogrames}}. Si treus la seqüència, se'ls endú tots i no es pot desfer.",
    description: "Cos de la confirmació: què es perd en treure la seqüència",
  },
  confirmRemove: {
    id: "features.sequence.header.confirmRemove",
    defaultMessage: "Treu la seqüència",
    description: "Botó que confirma treure una seqüència",
  },
});

export default messages;
