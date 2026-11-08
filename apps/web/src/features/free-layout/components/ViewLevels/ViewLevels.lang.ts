import { defineMessages } from "react-intl";

// Textos dels nivells «Pàgina» i «Bloc» de la columna de la vista (R5).
const messages = defineMessages({
  columnsHelp: {
    id: "features.freeLayout.levels.columnsHelp",
    defaultMessage:
      "Automatic: on a page in columns, one column; in rows, a single row; with a template, whatever makes the pictograms largest.",
    description:
      "Ajuda sota «Columnes» del bloc: què fan les automàtiques segons el repartiment de la pàgina",
  },
  columnsAuto: {
    id: "features.freeLayout.levels.columnsAuto",
    defaultMessage: "Automatic",
    description:
      "Opció de «Columnes» del bloc: les que demana el repartiment de la pàgina",
  },
  columns: {
    id: "features.freeLayout.levels.columns",
    defaultMessage: "Columns",
    description:
      "Títol de la fila del nivell «Bloc»: en quantes columnes van els pictogrames de dins del bloc",
  },
  uniformApplied: {
    id: "features.freeLayout.levels.uniformApplied",
    defaultMessage:
      "{unit, select, sequences {Every sequence} other {Every block}} on the page now has the size, spacing and alignment of the smallest one: {name}.",
    description:
      "Snackbar en activar «La mateixa…»: totes les seqüències o blocs de la pàgina passen a tenir la configuració de la més petita, que es diu (`name`)",
  },
  pages: {
    id: "features.freeLayout.levels.pages",
    defaultMessage: "Pages",
    description:
      "Fila del nivell «Pàgina» quan el document només té la pàgina de sempre: el botó per afegir-ne una altra",
  },
  licenceOn: {
    id: "features.freeLayout.levels.licenceOn",
    defaultMessage: "On which pages",
    description:
      "Fila del peu d'impressió, amb diverses pàgines: si el peu de llicència va a totes les pàgines o només a l'última",
  },
  licenceOnEvery: {
    id: "features.freeLayout.levels.licenceOnEvery",
    defaultMessage: "Every page",
    description: "Opció: el peu de llicència a totes les pàgines",
  },
  licenceOnLast: {
    id: "features.freeLayout.levels.licenceOnLast",
    defaultMessage: "Only the last one",
    description: "Opció: el peu de llicència només a l'última pàgina",
  },
  mode: {
    id: "features.freeLayout.levels.mode",
    defaultMessage: "Layout",
    description:
      "Títol de la fila del nivell «Pàgina» on es tria si la pàgina és contínua (com sempre) o en blocs",
  },
  modeAuto: {
    id: "features.freeLayout.levels.modeAuto",
    defaultMessage: "Continuous: the sequences one after another, as always",
    description: "Nom accessible i tooltip de l'opció «Contínua» de la pàgina",
  },
  modeBlocks: {
    id: "features.freeLayout.levels.modeBlocks",
    defaultMessage: "In blocks: each sequence in its own place on the page",
    description: "Nom accessible i tooltip de l'opció «En blocs» de la pàgina",
  },
  modeAutoHelp: {
    id: "features.freeLayout.levels.modeAutoHelp",
    defaultMessage:
      "Continuous: the sequences go one after another, as always.",
    description: "Ajuda sota la fila de disposició de la pàgina, en contínua",
  },
  modeBlocksHelp: {
    id: "features.freeLayout.levels.modeBlocksHelp",
    defaultMessage:
      "In blocks: each sequence is a block with its own place on the page.",
    description: "Ajuda sota la fila de disposició de la pàgina, en blocs",
  },
  arrangement: {
    id: "features.freeLayout.levels.arrangement",
    defaultMessage: "Arrange by",
    description:
      "Títol de la fila del nivell «Pàgina», en blocs: per columnes, per files o amb una plantilla",
  },
  byColumns: {
    id: "features.freeLayout.levels.byColumns",
    defaultMessage: "In columns",
    description: "Nom accessible i tooltip: els blocs de la pàgina en columnes",
  },
  byRows: {
    id: "features.freeLayout.levels.byRows",
    defaultMessage: "In rows",
    description: "Nom accessible i tooltip: els blocs de la pàgina en files",
  },
  byTemplate: {
    id: "features.freeLayout.levels.byTemplate",
    defaultMessage: "With a template",
    description:
      "Nom accessible i tooltip: els blocs de la pàgina amb una plantilla",
  },
  columnCount: {
    id: "features.freeLayout.levels.columnCount",
    defaultMessage: "Columns",
    description: "Títol de la fila amb quantes columnes de blocs té la pàgina",
  },
  rowCount: {
    id: "features.freeLayout.levels.rowCount",
    defaultMessage: "Rows",
    description: "Títol de la fila amb quantes files de blocs té la pàgina",
  },
  arrangementSummary: {
    id: "features.freeLayout.levels.arrangementSummary",
    defaultMessage:
      "{kind, select, columns {{n, plural, one {# column} other {# columns}}} other {{n, plural, one {# row} other {# rows}}}}",
    description:
      "Resum del repartiment d'una pàgina en blocs: quantes columnes o files",
  },
  blocksSummary: {
    id: "features.freeLayout.levels.blocksSummary",
    defaultMessage:
      "In blocks, {arrangement} · {count, plural, one {# block} other {# blocks}}",
    description:
      "Resum del nivell «Pàgina» plegat, en blocs: el repartiment i quants blocs té",
  },
  gridName: {
    id: "features.freeLayout.levels.gridName",
    defaultMessage: "Grid {columns} × {rows}",
    description: "Nom d'una plantilla de graella que no en té cap de propi",
  },
  pictograms: {
    id: "features.freeLayout.levels.pictograms",
    defaultMessage: "Pictograms",
    description:
      "Secció del nivell «Pàgina» de la columna de la vista: la mida, l'espai i l'alineació dels pictogrames dels blocs de la pàgina",
  },
  uniform: {
    id: "features.freeLayout.levels.uniform",
    defaultMessage:
      "Same for {unit, select, sequences {every sequence} other {every block}}",
    description:
      "Interruptor del nivell «Pàgina»: totes les seqüències (pàgina contínua) o tots els blocs (pàgina en blocs) amb la mateixa mida, espai i alineació. `unit` és sequences o blocks",
  },
  uniformOn: {
    id: "features.freeLayout.levels.uniformOn",
    defaultMessage:
      "{unit, select, sequences {Every sequence on this page has} other {Every block on this page has}} the same size, spacing and alignment. Turn it off to adjust {unit, select, sequences {each sequence} other {each block}} on its own.",
    description:
      "Ajuda sota «La mateixa a totes les seqüències / tots els blocs», activat",
  },
  uniformOff: {
    id: "features.freeLayout.levels.uniformOff",
    defaultMessage:
      "{unit, select, sequences {Each sequence has} other {Each block has}} its own size, spacing and alignment: click {unit, select, sequences {a sequence} other {a block}} on the page to adjust it.",
    description:
      "Ajuda sota «La mateixa a totes les seqüències / tots els blocs», desactivat",
  },
  uniformBlock: {
    id: "features.freeLayout.levels.uniformBlock",
    defaultMessage:
      "This page uses the same size, spacing and alignment for {unit, select, sequences {every sequence} other {every block}}: change them in “Page”, or turn that off there to adjust {unit, select, sequences {this sequence} other {this block}} on its own.",
    description:
      "Al nivell «Seqüència / Bloc», en lloc de la mida, l'espai i l'alineació, quan la pàgina té «La mateixa…» activat",
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
