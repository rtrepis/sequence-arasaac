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
  template: {
    id: "features.freeLayout.page.template",
    defaultMessage: "Template",
    description:
      "Botó de la capçalera d'una pàgina que obre les plantilles per repartir-hi les seqüències",
  },
  templateMenuTitle: {
    id: "features.freeLayout.page.templateMenuTitle",
    defaultMessage: "Distribute this page",
    description: "Títol del menú de plantilles d'una pàgina",
  },
  templateNone: {
    id: "features.freeLayout.page.templateNone",
    defaultMessage: "This page has more sequences than any template",
    description:
      "Al menú de plantilles, quan la pàgina té més seqüències que espais té cap plantilla",
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
});

export default messages;
