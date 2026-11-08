import { defineMessages } from "react-intl";

// Textos de les pàgines del mode lliure (ADR-005): la capçalera de cada pàgina,
// les caixes i el seu menú, i els missatges de les accions.
const messages = defineMessages({
  pageLabel: {
    id: "features.freeLayout.page.label",
    defaultMessage: "Page {number} of {total}",
    description:
      "Capçalera de cada pàgina del mode lliure, a sobre del full; no s'imprimeix",
  },
  addSequence: {
    id: "features.freeLayout.page.addSequence",
    defaultMessage: "Add a sequence",
    description:
      "Botó de la capçalera d'una pàgina: obre la llista de seqüències del document per posar-ne a la pàgina",
  },
  emptyPage: {
    id: "features.freeLayout.page.empty",
    defaultMessage: "This page is empty",
    description:
      "Text al mig d'una pàgina sense cap seqüència, damunt del botó per afegir-n'hi; no s'imprimeix",
  },
  templateFull: {
    id: "features.freeLayout.template.full",
    defaultMessage: "Whole page",
    description: "Plantilla: una sola seqüència que ocupa tota la pàgina",
  },
  templateRows2: {
    id: "features.freeLayout.template.rows2",
    defaultMessage: "Two in rows",
    description: "Plantilla: dues seqüències, una sota l'altra",
  },
  templateColumns2: {
    id: "features.freeLayout.template.columns2",
    defaultMessage: "Two in columns",
    description: "Plantilla: dues seqüències, l'una al costat de l'altra",
  },
  templateRows3: {
    id: "features.freeLayout.template.rows3",
    defaultMessage: "Three in rows",
    description: "Plantilla: tres seqüències, una sota l'altra",
  },
  templateGrid2x2: {
    id: "features.freeLayout.template.grid2x2",
    defaultMessage: "Four (2 × 2)",
    description: "Plantilla: quatre seqüències en dues files i dues columnes",
  },
  templateStripTop: {
    id: "features.freeLayout.template.stripTop",
    defaultMessage: "Strip on top, large below",
    description: "Plantilla: una franja estreta a dalt i un espai gran a sota",
  },
  pageMoreActions: {
    id: "features.freeLayout.page.moreActions",
    defaultMessage: "More page actions",
    description:
      "Nom accessible i tooltip del botó de més accions d'una pàgina (duplicar, moure, esborrar)",
  },
  duplicatePage: {
    id: "features.freeLayout.page.duplicate",
    defaultMessage: "Duplicate page",
    description: "Acció del menú d'una pàgina",
  },
  movePageUp: {
    id: "features.freeLayout.page.moveUp",
    defaultMessage: "Move page up",
    description: "Acció del menú d'una pàgina: la passa davant de l'anterior",
  },
  movePageDown: {
    id: "features.freeLayout.page.moveDown",
    defaultMessage: "Move page down",
    description: "Acció del menú d'una pàgina: la passa darrere de la següent",
  },
  deletePage: {
    id: "features.freeLayout.page.delete",
    defaultMessage: "Delete page",
    description:
      "Acció del menú d'una pàgina: n'esborra la pàgina, no les seqüències, i es pot desfer",
  },
  addPage: {
    id: "features.freeLayout.page.add",
    defaultMessage: "Add a page",
    description: "Botó al final de les pàgines del mode lliure",
  },
  placementLabel: {
    id: "features.freeLayout.placement.label",
    defaultMessage:
      "{name}, {count, plural, one {# pictogram} other {# pictograms}}{common, select, true {, on every page} other {}}",
    description:
      "Nom accessible d'un bloc del mode lliure, que el selecciona. `common` diu si surt a totes les pàgines",
  },
  placementActions: {
    id: "features.freeLayout.placement.actions",
    defaultMessage: "Actions for {name}",
    description:
      "Nom accessible i tooltip del botó d'un bloc, a dalt a la dreta, que obre el seu menú",
  },
  placementTooSmall: {
    id: "features.freeLayout.placement.tooSmall",
    defaultMessage: "The pictograms are too small in this box",
    description:
      "Avís damunt d'una caixa on els pictogrames queden per sota de la mida mínima; no s'imprimeix",
  },
  commonMark: {
    id: "features.freeLayout.placement.commonMark",
    defaultMessage: "On every page",
    description:
      "Marca damunt d'una caixa que surt a totes les pàgines; no s'imprimeix",
  },
  onEveryPage: {
    id: "features.freeLayout.placement.onEveryPage",
    defaultMessage: "On every page",
    description:
      "Opció del menú d'una caixa: la seqüència surt a totes les pàgines, al mateix lloc",
  },
  copyToPage: {
    id: "features.freeLayout.placement.copyToPage",
    defaultMessage: "Copy to page",
    description:
      "Títol de la llista del menú d'una caixa per fer-ne una còpia independent en una altra pàgina",
  },
  pageNumber: {
    id: "features.freeLayout.placement.pageNumber",
    defaultMessage: "Page {number}",
    description: "Una pàgina, a les llistes del menú d'una caixa",
  },
  removeFromPage: {
    id: "features.freeLayout.placement.removeFromPage",
    defaultMessage: "Remove from this page",
    description:
      "Acció del menú d'una caixa: la treu d'aquesta pàgina; la seqüència continua al document",
  },
  removeFromEveryPage: {
    id: "features.freeLayout.placement.removeFromEveryPage",
    defaultMessage: "Remove from every page",
    description:
      "Acció del menú d'una caixa que surt a totes les pàgines: la treu de totes",
  },
  sequenceName: {
    id: "features.freeLayout.sequence.name",
    defaultMessage: "Sequence {number}",
    description:
      "Nom d'una seqüència que no en té cap de propi: el número de la seva pestanya",
  },
  pageAdded: {
    id: "features.freeLayout.feedback.pageAdded",
    defaultMessage: "Page {number} added",
    description: "Confirmació d'haver afegit una pàgina",
  },
  pageDuplicated: {
    id: "features.freeLayout.feedback.pageDuplicated",
    defaultMessage: "Page duplicated as page {number}",
    description: "Confirmació d'haver duplicat una pàgina",
  },
  pageMoved: {
    id: "features.freeLayout.feedback.pageMoved",
    defaultMessage: "The page is now page {number}",
    description: "Confirmació d'haver mogut una pàgina",
  },
  copiedToPage: {
    id: "features.freeLayout.feedback.copiedToPage",
    defaultMessage: "{name} copied to page {number}",
    description: "Confirmació d'haver copiat una seqüència a una altra pàgina",
  },
  madeCommon: {
    id: "features.freeLayout.feedback.madeCommon",
    defaultMessage: "{name} is now on every page",
    description: "Confirmació d'haver posat una seqüència a totes les pàgines",
  },
  templateAgendaStrip: {
    id: "features.freeLayout.template.agendaStrip",
    defaultMessage: "Schedule strip",
    description:
      "Plantilla (R3): una tira estreta i llarga al mig del full, per a l'agenda del dia",
  },
  templateTodayAgenda: {
    id: "features.freeLayout.template.todayAgenda",
    defaultMessage: "Today is + schedule",
    description:
      "Plantilla (R3): un rètol a dalt («Avui és…») i l'agenda del dia a sota",
  },
  templateFirstThen: {
    id: "features.freeLayout.template.firstThen",
    defaultMessage: "First / Then",
    description:
      "Plantilla (R3): dos espais iguals, l'un al costat de l'altre, amb els rètols «Primer» i «Després»",
  },
  templateWeek: {
    id: "features.freeLayout.template.week",
    defaultMessage: "Week",
    description:
      "Plantilla (R3): cinc columnes, de dilluns a divendres, amb el nom del dia a dalt",
  },
  templateTokenBoard: {
    id: "features.freeLayout.template.tokenBoard",
    defaultMessage: "Token board",
    description:
      "Plantilla (R3): el rètol «Treballo per…», una tira per a les fitxes i un espai gran per al premi",
  },
  templateStoryPage: {
    id: "features.freeLayout.template.storyPage",
    defaultMessage: "Story page",
    description:
      "Plantilla (R3): tres frases d'un conte o d'una història social, una sota l'altra",
  },
  templateMenu: {
    id: "features.freeLayout.template.menu",
    defaultMessage: "Menu",
    description:
      "Plantilla (R3): el menú del menjador, amb tres franges (primer plat, segon plat i postres) i el seu rètol",
  },
  slotTextToday: {
    id: "features.freeLayout.slotText.today",
    defaultMessage: "Today is",
    description:
      "Text amb què neix el rètol de la plantilla «Avui és + agenda». Després l'usuari el pot canviar",
  },
  slotTextFirst: {
    id: "features.freeLayout.slotText.first",
    defaultMessage: "First",
    description:
      "Text amb què neix el primer rètol de la plantilla «Primer / Després»",
  },
  slotTextThen: {
    id: "features.freeLayout.slotText.then",
    defaultMessage: "Then",
    description:
      "Text amb què neix el segon rètol de la plantilla «Primer / Després»",
  },
  slotTextMonday: {
    id: "features.freeLayout.slotText.monday",
    defaultMessage: "Monday",
    description: "Rètol d'un dia a la plantilla «Setmana»",
  },
  slotTextTuesday: {
    id: "features.freeLayout.slotText.tuesday",
    defaultMessage: "Tuesday",
    description: "Rètol d'un dia a la plantilla «Setmana»",
  },
  slotTextWednesday: {
    id: "features.freeLayout.slotText.wednesday",
    defaultMessage: "Wednesday",
    description: "Rètol d'un dia a la plantilla «Setmana»",
  },
  slotTextThursday: {
    id: "features.freeLayout.slotText.thursday",
    defaultMessage: "Thursday",
    description: "Rètol d'un dia a la plantilla «Setmana»",
  },
  slotTextFriday: {
    id: "features.freeLayout.slotText.friday",
    defaultMessage: "Friday",
    description: "Rètol d'un dia a la plantilla «Setmana»",
  },
  slotTextWorkingFor: {
    id: "features.freeLayout.slotText.workingFor",
    defaultMessage: "I'm working for…",
    description:
      "Text amb què neix el rètol de la plantilla «Economia de fitxes», damunt del premi",
  },
  slotTextFirstCourse: {
    id: "features.freeLayout.slotText.firstCourse",
    defaultMessage: "First course",
    description: "Rètol de la primera franja de la plantilla «Menú»",
  },
  slotTextSecondCourse: {
    id: "features.freeLayout.slotText.secondCourse",
    defaultMessage: "Main course",
    description: "Rètol de la segona franja de la plantilla «Menú»",
  },
  slotTextDessert: {
    id: "features.freeLayout.slotText.dessert",
    defaultMessage: "Dessert",
    description: "Rètol de la tercera franja de la plantilla «Menú»",
  },
  textBlockLabel: {
    id: "features.freeLayout.textBlock.label",
    defaultMessage:
      "Label: {text}{common, select, true {, on every page} other {}}",
    description:
      "Nom accessible d'un rètol (bloc de text) damunt del full, que el selecciona. `common` diu si surt a totes les pàgines",
  },
  textBlockEmpty: {
    id: "features.freeLayout.textBlock.empty",
    defaultMessage: "Empty label",
    description: "Nom d'un rètol sense text, a la columna i al full",
  },
  textBlockActions: {
    id: "features.freeLayout.textBlock.actions",
    defaultMessage: "Actions for the label “{text}”",
    description: "Nom accessible del botó «⋯» d'un rètol damunt del full",
  },
  guideText: {
    id: "features.freeLayout.guide.text",
    defaultMessage: "Label",
    description:
      "Marca damunt d'un espai de rètol, mentre es previsualitza una plantilla a la pàgina; no s'imprimeix",
  },
  addBlock: {
    id: "features.freeLayout.page.addBlock",
    defaultMessage: "Add a block",
    description:
      "Botó de la capçalera d'una pàgina en blocs, i títol del grup del menú de la pàgina, per afegir-hi un bloc de seqüència o de text",
  },
  addSequenceBlock: {
    id: "features.freeLayout.page.addSequenceBlock",
    defaultMessage: "Sequence block…",
    description:
      "Opció per afegir un bloc amb una seqüència del document a la pàgina; obre la llista de seqüències",
  },
  addTextBlock: {
    id: "features.freeLayout.page.addTextBlock",
    defaultMessage: "Text block",
    description:
      "Opció per afegir un rètol (un text sol, sense pictograma) a la pàgina",
  },
  textBlockAdded: {
    id: "features.freeLayout.page.textBlockAdded",
    defaultMessage:
      "A text block has been added to page {number}. Type it in the side panel.",
    description:
      "Missatge després d'afegir un rètol a una pàgina: queda seleccionat i el text s'escriu a la columna d'ajustos",
  },
  layoutSection: {
    id: "features.freeLayout.page.layoutSection",
    defaultMessage: "Layout",
    description:
      "Títol del grup del menú d'una pàgina on es tria si és contínua o en blocs",
  },
  chooseTemplate: {
    id: "features.freeLayout.page.chooseTemplate",
    defaultMessage: "Template…",
    description:
      "Opció del menú d'una pàgina que obre les plantilles amb miniatura",
  },
  templatesTitle: {
    id: "features.freeLayout.page.templatesTitle",
    defaultMessage: "Templates for page {number}",
    description:
      "Títol de la finestra de plantilles que s'obre des del menú d'una pàgina",
  },
  emptySlotLabel: {
    id: "features.freeLayout.emptySlot.label",
    defaultMessage: "Empty space {number}",
    description:
      "Nom d'un espai lliure de la plantilla, damunt del full, amb els botons per omplir-lo; no s'imprimeix",
  },
  emptySlotAddText: {
    id: "features.freeLayout.emptySlot.addText",
    defaultMessage: "Add text",
    description: "Botó d'un espai buit del full que hi posa un rètol",
  },
  emptySlotAddSequence: {
    id: "features.freeLayout.emptySlot.addSequence",
    defaultMessage: "Add a sequence",
    description:
      "Botó d'un espai buit del full que hi posa una seqüència del document",
  },
  modeContinuous: {
    id: "features.freeLayout.page.modeContinuous",
    defaultMessage: "Continuous",
    description:
      "Opció del menú d'una pàgina: les seqüències una darrere l'altra, com sempre",
  },
  modeBlocks: {
    id: "features.freeLayout.page.modeBlocks",
    defaultMessage: "In blocks",
    description:
      "Opció del menú d'una pàgina: cada seqüència o text és un bloc amb el seu lloc a la pàgina",
  },
  previousPage: {
    id: "features.freeLayout.page.previousPage",
    defaultMessage: "Previous page",
    description:
      "Botó del mòbil, a sobre de la pàgina, que ensenya la pàgina anterior (també es pot lliscar)",
  },
  nextPage: {
    id: "features.freeLayout.page.nextPage",
    defaultMessage: "Next page",
    description:
      "Botó del mòbil, a sobre de la pàgina, que ensenya la pàgina següent (també es pot lliscar)",
  },
  templateFree: {
    id: "features.freeLayout.template.free",
    defaultMessage: "Free",
    description:
      "Nom del repartiment lliure d'una pàgina: cada bloc on l'usuari l'ha posat",
  },
  arrangementTag: {
    id: "features.freeLayout.page.arrangementTag",
    defaultMessage:
      "{kind, select, continuous {Continuous} columns {Columns · {n}} rows {Rows · {n}} free {Free} other {{name}}}",
    description:
      "Etiqueta de la capçalera d'una pàgina que diu com es reparteix: contínua, N columnes, N files, lliure o el nom de la plantilla (`name`)",
  },
  arrangementHint: {
    id: "features.freeLayout.page.arrangementHint",
    defaultMessage:
      "{kind, select, continuous {Adding a sequence puts it at the end.} columns {Adding a block adds one more column.} rows {Adding a block adds one more row.} free {Adding a block puts it in the largest empty space, without moving the others.} other {Adding a block fills the first empty space; if there is none, the page becomes free.}}",
    description:
      "Tooltip de l'etiqueta del repartiment de la pàgina: què passarà en afegir-hi un bloc",
  },
});

export default messages;
