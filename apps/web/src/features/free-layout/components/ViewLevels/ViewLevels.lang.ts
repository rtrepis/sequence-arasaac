import { defineMessages } from "react-intl";

// Textos dels nivells «Pàgina» i «Bloc» de la columna de la vista (R5).
const messages = defineMessages({
  pictograms: {
    id: "features.freeLayout.levels.pictograms",
    defaultMessage: "Pictograms",
    description:
      "Secció del nivell «Pàgina» de la columna de la vista: la mida, l'espai i l'alineació dels pictogrames dels blocs de la pàgina",
  },
  uniform: {
    id: "features.freeLayout.levels.uniform",
    defaultMessage: "Same for every block",
    description:
      "Interruptor del nivell «Pàgina»: tots els blocs de la pàgina amb la mateixa mida, espai i alineació (l'antic «Aplica a totes», ara per pàgina)",
  },
  uniformOn: {
    id: "features.freeLayout.levels.uniformOn",
    defaultMessage:
      "Every block on this page has the same size, spacing and alignment. Turn it off to adjust each block on its own.",
    description: "Ajuda sota «La mateixa a tots els blocs», activat",
  },
  uniformOff: {
    id: "features.freeLayout.levels.uniformOff",
    defaultMessage:
      "Each block has its own size, spacing and alignment: click a block on the page to adjust it.",
    description: "Ajuda sota «La mateixa a tots els blocs», desactivat",
  },
  uniformBlock: {
    id: "features.freeLayout.levels.uniformBlock",
    defaultMessage:
      "This page uses the same size, spacing and alignment for every block: change them in “Page”, or turn that off there to adjust this block on its own.",
    description:
      "Al nivell «Bloc», en lloc de la mida, l'espai i l'alineació, quan la pàgina té «La mateixa a tots els blocs» activat",
  },
  pageSummary: {
    id: "features.freeLayout.levels.pageSummary",
    defaultMessage:
      "{template} · {count, plural, one {# block} other {# blocks}}",
    description:
      "Resum del nivell «Pàgina» plegat: la plantilla i quants blocs té la pàgina",
  },
  noTemplate: {
    id: "features.freeLayout.levels.noTemplate",
    defaultMessage: "No template",
    description:
      "Al selector de plantilla de la pàgina, quan la pàgina no en té cap de les que l'app ofereix",
  },
  pageActions: {
    id: "features.freeLayout.levels.pageActions",
    defaultMessage: "Page actions",
    description:
      "Títol de la fila del nivell «Pàgina» amb el menú de la pàgina (duplicar, moure, esborrar)",
  },
  blockScope: {
    id: "features.freeLayout.levels.blockScope",
    defaultMessage:
      "{common, select, true {Applies only to this block, on every page} other {Applies only to this block}}",
    description:
      "Sota el nom del bloc seleccionat, al nivell «Bloc» de la columna de la vista",
  },
  sequenceScope: {
    id: "features.freeLayout.levels.sequenceScope",
    defaultMessage: "Applies only to this sequence",
    description:
      "Sota el nom de la seqüència seleccionada, al nivell «Bloc», a la disposició automàtica",
  },
  sizeMax: {
    id: "features.freeLayout.levels.sizeMax",
    defaultMessage: "At most. Pictograms come out at {mm} mm now.",
    description:
      "Ajuda de la mida dels pictogrames d'un bloc en una plantilla: la mida és un màxim, i diu la que en surt de debò (mm és el costat de la imatge)",
  },
  sizeTooSmall: {
    id: "features.freeLayout.levels.sizeTooSmall",
    defaultMessage:
      "The block is too small: pictograms come out at {mm} mm. Make it bigger or choose other columns.",
    description: "Ajuda de la mida d'un bloc quan hi queden massa petits",
  },
  putOnPage: {
    id: "features.freeLayout.levels.putOnPage",
    defaultMessage: "To page {number}",
    description:
      "Botó al costat de cada seqüència sense col·locar: la posa a la pàgina que segueix la columna",
  },
  putOnPageLabel: {
    id: "features.freeLayout.levels.putOnPageLabel",
    defaultMessage: "Put {name} on page {number}",
    description:
      "Nom accessible del botó que posa una seqüència sense col·locar a la pàgina que segueix la columna",
  },
});

export default messages;
