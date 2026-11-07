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
  untitled: {
    id: "pages.viewSequence.levels.untitled",
    defaultMessage: "This document",
    description:
      "Nom del nivell «Document» de la columna de la vista quan el document encara no té títol",
  },
  kindPage: {
    id: "pages.viewSequence.levels.kindPage",
    defaultMessage: "Page",
    description:
      "Tipus del segon nivell de la columna de la vista, a sobre de «Pàgina 2 de 3»",
  },
  kindBlock: {
    id: "pages.viewSequence.levels.kindBlock",
    defaultMessage: "Block",
    description:
      "Tipus del tercer nivell de la columna de la vista, a sobre del nom del bloc seleccionat",
  },
  noBlock: {
    id: "pages.viewSequence.levels.noBlock",
    defaultMessage: "No block selected",
    description:
      "Nom del nivell «Bloc» de la columna de la vista quan no n'hi ha cap de seleccionat",
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
