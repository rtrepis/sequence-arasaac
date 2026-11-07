import { defineMessages } from "react-intl";

// Textos dels nivells de la columna de la vista (R5, R8): Document, Pàgina i
// Bloc, les molles i els resums dels nivells plegats.
const messages = defineMessages({
  crumbs: {
    id: "pages.viewSequence.levels.crumbs",
    defaultMessage: "Where these settings apply",
    description:
      "Nom accessible de les molles de dalt de la columna de la vista (Document › Pàgina 2 › Bloc)",
  },
  document: {
    id: "pages.viewSequence.levels.document",
    defaultMessage: "Document",
    description:
      "Títol del primer nivell de la columna de la vista: el que s'aplica a tot el document",
  },
  documentScope: {
    id: "pages.viewSequence.levels.documentScope",
    defaultMessage: "Applies to every page",
    description: "Sota el títol «Document» de la columna de la vista",
  },
  pageScope: {
    id: "pages.viewSequence.levels.pageScope",
    defaultMessage:
      "{total, plural, one {Applies to the page} other {Applies only to page {number}}}",
    description:
      "Sota el títol «Pàgina N de M» de la columna de la vista. Amb una sola pàgina, no cal dir quina",
  },
  pictograms: {
    id: "pages.viewSequence.levels.pictograms",
    defaultMessage: "Pictograms",
    description:
      "Secció del nivell «Document» de la columna de la vista: la mida, l'espai i l'alineació dels pictogrames de tot el document",
  },
  pictogramsHint: {
    id: "pages.viewSequence.levels.pictogramsHint",
    defaultMessage:
      "For every block. A block you have adjusted on its own keeps its own settings.",
    description:
      "Ajuda sota la mida dels pictogrames del nivell «Document»: s'aplica a tots els blocs, menys el que s'hagi retocat al nivell «Bloc»",
  },
  noSelection: {
    id: "pages.viewSequence.levels.noSelection",
    defaultMessage: "Click a block on the page to see its settings.",
    description:
      "Al final dels nivells de la columna de la vista quan no hi ha cap bloc seleccionat",
  },
  layoutFlowShort: {
    id: "pages.viewSequence.levels.layoutFlowShort",
    defaultMessage: "Automatic",
    description:
      "Resum del nivell «Document» plegat: la disposició és automàtica",
  },
  layoutFreeShort: {
    id: "pages.viewSequence.levels.layoutFreeShort",
    defaultMessage: "Free",
    description: "Resum del nivell «Document» plegat: la disposició és lliure",
  },
  landscapeShort: {
    id: "pages.viewSequence.levels.landscapeShort",
    defaultMessage: "landscape",
    description:
      "Resum del nivell «Document» plegat, després de la mida del paper («A4 apaïsat»)",
  },
  portraitShort: {
    id: "pages.viewSequence.levels.portraitShort",
    defaultMessage: "portrait",
    description:
      "Resum del nivell «Document» plegat, després de la mida del paper («A4 vertical»)",
  },
  directionRowShort: {
    id: "pages.viewSequence.levels.directionRowShort",
    defaultMessage: "Automatic, in rows",
    description:
      "Resum del nivell «Pàgina» plegat, a la disposició automàtica: les seqüències van en files",
  },
  directionColumnShort: {
    id: "pages.viewSequence.levels.directionColumnShort",
    defaultMessage: "Automatic, in columns",
    description:
      "Resum del nivell «Pàgina» plegat, a la disposició automàtica: les seqüències van en columnes",
  },
});

export default messages;
