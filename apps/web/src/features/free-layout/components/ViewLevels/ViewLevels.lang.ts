import { defineMessages } from "react-intl";

// Textos dels nivells «Pàgina» i «Bloc» de la columna de la vista (R5).
const messages = defineMessages({
  columnsHelp: {
    id: "features.freeLayout.levels.columnsHelp",
    defaultMessage: "How many pictograms per row inside the block.",
    description:
      "Ajuda sota les columnes d'un bloc: quants pictogrames hi ha a cada fila de dins del bloc",
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
  noTemplate: {
    id: "features.freeLayout.levels.noTemplate",
    defaultMessage: "No template",
    description:
      "Al selector de plantilla de la pàgina, quan la pàgina no en té cap de les que l'app ofereix",
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
  templateHelp: {
    id: "features.freeLayout.levels.templateHelp",
    defaultMessage:
      "Hover over a template, or press and hold it, to see it on the page. Clicking applies it.",
    description:
      "Ajuda sota el selector de plantilles del nivell «Pàgina»: com es previsualitza i com s'aplica",
  },
  templateLandscape: {
    id: "features.freeLayout.levels.templateLandscape",
    defaultMessage: "Best in landscape",
    description:
      "Al selector de plantilles, al costat del nom d'una plantilla que queda millor en paper apaïsat (la setmana, «Primer / Després»)",
  },
  kindText: {
    id: "features.freeLayout.levels.kindText",
    defaultMessage: "Label",
    description:
      "Tipus del tercer nivell de la columna de la vista quan el que hi ha seleccionat és un rètol (un text sol, sense pictograma)",
  },
  text: {
    id: "features.freeLayout.levels.text",
    defaultMessage: "Text",
    description:
      "Títol de la fila on s'escriu el text d'un rètol, al nivell «Rètol» de la columna",
  },
  fontSize: {
    id: "features.freeLayout.levels.fontSize",
    defaultMessage: "Font size",
    description: "Títol de la fila de la mida de la lletra d'un rètol",
  },
  bold: {
    id: "features.freeLayout.levels.bold",
    defaultMessage: "Bold",
    description: "Títol de la fila de l'interruptor de negreta d'un rètol",
  },
  templateLossTitle: {
    id: "features.freeLayout.levels.templateLossTitle",
    defaultMessage: "Apply “{name}” to page {number}?",
    description:
      "Títol de l'avís abans d'aplicar una plantilla on no hi caben tots els blocs de la pàgina",
  },
  templateLossBody: {
    id: "features.freeLayout.levels.templateLossBody",
    defaultMessage:
      "{count, plural, one {One block doesn't fit and will leave this page} other {# blocks don't fit and will leave this page}}: {blocks}. The sequences stay in the document, and it can be undone.",
    description:
      "Cos de l'avís abans d'aplicar una plantilla: quins blocs (noms de seqüència o text de rètols) surten de la pàgina",
  },
  templateLossConfirm: {
    id: "features.freeLayout.levels.templateLossConfirm",
    defaultMessage: "Apply it",
    description:
      "Botó de l'avís que aplica la plantilla tot i que alguns blocs surten de la pàgina",
  },
  byFree: {
    id: "features.freeLayout.levels.byFree",
    defaultMessage: "Free: each block where you put it",
    description:
      "Botó del repartiment d'una pàgina en blocs: els blocs no segueixen cap graella; un bloc nou va a l'espai buit més gran, sense moure els altres",
  },
  newTag: {
    id: "features.freeLayout.levels.newTag",
    defaultMessage: "New",
    description:
      "Etiqueta al costat d'un ajust nou de la columna («Disposició»)",
  },
  templates: {
    id: "features.freeLayout.levels.templates",
    defaultMessage: "Templates",
    description:
      "Títol de la graella de plantilles amb miniatura, sota el repartiment d'una pàgina en blocs",
  },
});

export default messages;
