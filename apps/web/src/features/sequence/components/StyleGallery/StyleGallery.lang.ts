import { defineMessages } from "react-intl";

// Textos de la Galeria d'estils (pla dels estils, pas 5)
const messages = defineMessages({
  title: {
    id: "features.sequence.styleGallery.title",
    defaultMessage: "Galeria d'estils",
    description:
      "Títol del diàleg d'on es tria l'estil d'una seqüència. Mai «tema» ni «plantilla»",
  },
  forTarget: {
    id: "features.sequence.styleGallery.forTarget",
    defaultMessage:
      "{kind, select, block {Tria l'estil d'aquest bloc de «{name}». Només canvia aquest bloc.} other {Tria l'estil de «{name}».}}",
    description:
      "Primera línia de la Galeria d'estils: per a quina seqüència, o per a quin bloc d'una seqüència, es tria l'estil",
  },
  currentGroup: {
    id: "features.sequence.styleGallery.currentGroup",
    defaultMessage: "El d'ara",
    description:
      "Encapçalament de la Galeria d'estils sobre l'estil que fa servir la seqüència, quan no és cap dels altres de la galeria (p. ex. un de carregat d'un fitxer)",
  },
  documentStyle: {
    id: "features.sequence.styleGallery.documentStyle",
    defaultMessage: "L'estil del document",
    description:
      "Primera opció de la Galeria d'estils: la seqüència torna a fer servir l'estil del document",
  },
  sequenceStyle: {
    id: "features.sequence.styleGallery.sequenceStyle",
    defaultMessage: "L'estil de la seqüència",
    description:
      "Primera opció de la Galeria d'estils per a un bloc: el bloc torna a fer servir l'estil de la seva seqüència",
  },
  myStyle: {
    id: "features.sequence.styleGallery.myStyle",
    defaultMessage: "El meu estil",
    description:
      "Nom de l'estil de l'usuari a la Galeria d'estils; també s'escriu al document com a nom de l'estil copiat",
  },
  myStyleGroup: {
    id: "features.sequence.styleGallery.myStyleGroup",
    defaultMessage: "El meu estil",
    description:
      "Encapçalament del grup de la Galeria d'estils amb l'estil de l'usuari",
  },
  appStylesGroup: {
    id: "features.sequence.styleGallery.appStylesGroup",
    defaultMessage: "Estils de l'app",
    description:
      "Encapçalament del grup de la Galeria d'estils amb els estils que porta l'app",
  },
  appStylesEmpty: {
    id: "features.sequence.styleGallery.appStylesEmpty",
    defaultMessage: "Aviat n'hi haurà.",
    description:
      "Text del grup «Estils de l'app» de la Galeria d'estils mentre encara no n'hi ha cap",
  },
  inUse: {
    id: "features.sequence.styleGallery.inUse",
    defaultMessage:
      "{kind, select, block {El fa servir aquest bloc} other {El fa servir aquesta seqüència}}",
    description:
      "Segona línia de l'estil que fa servir la seqüència, a la Galeria d'estils",
  },
  sampleWord: {
    id: "features.sequence.styleGallery.sampleWord",
    defaultMessage: "exemple",
    description:
      "Paraula del pictograma de mostra de la Galeria d'estils, quan la seqüència encara no en té cap",
  },
  styleActions: {
    id: "features.sequence.styleGallery.styleActions",
    defaultMessage: "Més accions de «{name}»",
    description:
      "Nom accessible i tooltip del botó «⋯» de cada estil de la Galeria d'estils",
  },
  saveToFile: {
    id: "features.sequence.styleGallery.saveToFile",
    defaultMessage: "Desa en un fitxer",
    description:
      "Acció d'un estil de la Galeria d'estils: el desa en un fitxer d'estil (.saacstyle)",
  },
  makeMyStyle: {
    id: "features.sequence.styleGallery.makeMyStyle",
    defaultMessage: "Fes-lo el meu estil",
    description:
      "Acció d'un estil de la Galeria d'estils: passa a ser l'estil de l'usuari. No toca el document obert",
  },
  loadFromFile: {
    id: "features.sequence.styleGallery.loadFromFile",
    defaultMessage: "Carrega d'un fitxer…",
    description:
      "Botó de la Galeria d'estils: aplica a la seqüència l'estil d'un fitxer. L'estil no es queda a la galeria",
  },
});

export default messages;
