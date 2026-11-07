import { defineMessages } from "react-intl";

// Textos dels nivells «Pàgina» i «Bloc» de la columna de la vista (R5).
const messages = defineMessages({
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
  place: {
    id: "features.freeLayout.levels.place",
    defaultMessage: "Place",
    description:
      "Secció del nivell «Bloc»: a totes les pàgines, copiar-lo a una altra pàgina, treure'l",
  },
  choosePage: {
    id: "features.freeLayout.levels.choosePage",
    defaultMessage: "Choose a page…",
    description:
      "Valor inicial del selector «Copia a la pàgina» del nivell «Bloc»",
  },
  remove: {
    id: "features.freeLayout.levels.remove",
    defaultMessage: "Remove",
    description:
      "Botó de la fila «Treu d'aquesta pàgina» del nivell «Bloc»: treu el bloc, amb Desfés",
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
