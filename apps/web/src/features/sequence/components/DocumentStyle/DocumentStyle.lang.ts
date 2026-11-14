import { defineMessages } from "react-intl";

// Missatges de l'estil: el bàner en obrir un document, el diàleg d'obrir un
// fitxer d'estil i el snackbar de desfer (el panell «El meu estil» té els seus). Vegeu
// `docs/fonaments/03-model-contingut-estil.md` (nomenclatura inclosa: «document» és el
// fitxer sencer, «seqüència» cadascuna de les que conté).
const messages = defineMessages({
  noticeLegacy: {
    id: "features.sequence.style.notice.legacy",
    defaultMessage:
      "Aquest document és d'una versió anterior. L'hem adaptat; quan el desis es guardarà amb el format nou.",
    description:
      "Bàner en obrir un document desat amb una versió anterior de l'app (format antic)",
  },
  noticeWithoutStyle: {
    id: "features.sequence.style.notice.withoutStyle",
    defaultMessage: "No portava estil propi, i hi hem aplicat el teu estil.",
    description:
      "S'afegeix al bàner de document antic quan el fitxer no portava estil (o no sencer): hi va el meu estil",
  },
  noticeNewerVersion: {
    id: "features.sequence.style.notice.newerVersion",
    defaultMessage:
      "Aquest document s'ha creat amb una versió més nova de SequenciAAC. Pot ser que alguna cosa no es vegi bé. Si el deses aquí, es podrien perdre canvis.",
    description:
      "Bàner d'avís en obrir un document d'una versió de l'app més nova que la d'ara",
  },
  setAsDefaultSuccess: {
    id: "features.sequence.style.setAsDefault.success",
    defaultMessage: "Ara és el teu estil.",
    description:
      "Confirmació de «Fes-lo el meu estil», en obrir un fitxer d'estil",
  },
  noticeOwnStyle: {
    id: "features.sequence.style.notice.ownStyle",
    defaultMessage: "Aquest document té el seu propi estil.",
    description:
      "Bàner en obrir un document amb un estil diferent de l'estil per defecte de l'usuari",
  },
  noticeUnavailableFonts: {
    id: "features.sequence.style.notice.unavailableFonts",
    defaultMessage:
      "Algunes fonts no estan disponibles en aquest dispositiu ({fonts}): es mostren amb una font de reserva.",
    description:
      "Bàner en obrir un document que fa servir fonts que el dispositiu no té. {fonts} és la llista de noms",
  },
  closeNotice: {
    id: "features.sequence.style.notice.close",
    defaultMessage: "Tanca l'avís",
    description:
      "Nom accessible del botó que tanca el bàner o el snackbar d'estil",
  },
  changedApplyAll: {
    id: "features.sequence.style.changed.applyAll",
    defaultMessage: "S'ha aplicat a tots els pictogrames del document.",
    description:
      "Snackbar després d'«Aplica a tots»: el valor passa a l'estil del document i a tots els pictogrames",
  },
  changedFitTextPictogram: {
    id: "features.sequence.style.changed.fitTextPictogram",
    defaultMessage:
      "S'ha reduït la lletra d'aquest pictograma perquè el text hi càpiga.",
    description:
      "Snackbar després de reduir la lletra d'un sol pictograma des de l'avís «el text no hi cap» (es pot desfer)",
  },
  changedFitTextDocument: {
    id: "features.sequence.style.changed.fitTextDocument",
    defaultMessage:
      "S'ha reduït la lletra de tot el document perquè el text hi càpiga.",
    description:
      "Snackbar després de reduir la lletra de l'estil del document des de l'avís «el text no hi cap» (es pot desfer)",
  },
  changedLayoutTemplate: {
    id: "features.sequence.style.changed.layoutTemplate",
    defaultMessage: "S'ha aplicat la plantilla a la pàgina.",
    description:
      "Snackbar amb «Desfés» en aplicar una plantilla a una pàgina del mode lliure",
  },
  changedLayoutAddSequences: {
    id: "features.sequence.style.changed.layoutAddSequences",
    defaultMessage:
      "S'han afegit les seqüències i s'ha tornat a repartir la pàgina.",
    description:
      "Snackbar amb «Desfés» en afegir seqüències a una pàgina del mode lliure, que es torna a repartir",
  },
  changedLayoutRemoveSheet: {
    id: "features.sequence.style.changed.layoutRemoveSheet",
    defaultMessage:
      "S'ha esborrat la pàgina. Les seqüències continuen al document.",
    description: "Snackbar amb «Desfés» en esborrar una pàgina del mode lliure",
  },
  changedLayoutRemovePlacement: {
    id: "features.sequence.style.changed.layoutRemovePlacement",
    defaultMessage:
      "S'ha tret de la pàgina. La seqüència continua al document.",
    description:
      "Snackbar amb «Desfés» en treure una seqüència d'una pàgina del mode lliure",
  },
  changedLayoutUncommon: {
    id: "features.sequence.style.changed.layoutUncommon",
    defaultMessage: "Ara només surt en aquesta pàgina.",
    description:
      "Snackbar amb «Desfés» en deixar de posar una seqüència a totes les pàgines",
  },
  changedReset: {
    id: "features.sequence.style.changed.reset",
    defaultMessage: "Estil restablert",
    description:
      "Snackbar després de «Restableix» un pictograma: se n'esborren els retocs",
  },
  undo: {
    id: "features.sequence.style.undo",
    defaultMessage: "Desfés",
    description: "Botó per desfer el canvi d'estil",
  },
  undone: {
    id: "features.sequence.style.undone",
    defaultMessage: "S'ha desfet el canvi",
    description:
      "Confirmació després de desfer un canvi d'estil o de disposició de la pàgina (el snackbar «Desfés» serveix per a tots dos)",
  },
  styleFileOpenedTitle: {
    id: "features.sequence.style.styleFileOpened.title",
    defaultMessage: "Aquest fitxer és un estil, no un document",
    description:
      "Títol del diàleg que surt en obrir un fitxer d'estil (.saacstyle) com si fos un document",
  },
  styleFileOpenedBody: {
    id: "features.sequence.style.styleFileOpened.body",
    defaultMessage:
      "Pots fer-lo el teu estil: el reben els documents nous, i el porta a un document «Aplica el meu estil», al menú «⋯» d'una pàgina o d'un bloc.",
    description:
      "Explicació del diàleg que surt en obrir un fitxer d'estil com si fos un document: només es pot fer el meu estil",
  },
  styleFileMakeDefault: {
    id: "features.sequence.style.styleFileOpened.makeDefault",
    defaultMessage: "Fes-lo el meu estil",
    description:
      "Botó que fa de l'estil del fitxer el meu estil (substitueix el que hi havia)",
  },
  loadedMyStyle: {
    id: "features.sequence.style.loadedMyStyle",
    defaultMessage: "S'ha carregat l'estil del fitxer com el teu estil.",
    description:
      "Snackbar després de «Carrega un estil des d'un fitxer…» al panell «El meu estil»",
  },
  changedMyStyleSheet: {
    id: "features.sequence.style.changed.myStyleSheet",
    defaultMessage: "S'ha aplicat el teu estil a la pàgina.",
    description:
      "Snackbar amb «Desfés» després d'«Aplica el meu estil» del menú «⋯» d'una pàgina",
  },
  changedMyStyleBlock: {
    id: "features.sequence.style.changed.myStyleBlock",
    defaultMessage: "S'ha aplicat el teu estil al bloc.",
    description:
      "Snackbar amb «Desfés» després d'«Aplica el meu estil» del menú «⋯» d'un bloc",
  },
  changedMyStyleUpdate: {
    id: "features.sequence.style.changed.myStyleUpdate",
    defaultMessage:
      "S'ha actualitzat l'estil de bloc amb el teu estil, a tots els blocs que el fan servir.",
    description:
      "Snackbar amb «Desfés» després d'«Actualitza amb el meu estil» del menú «⋯» d'una pàgina o d'un bloc",
  },
  changedBlockStyleRemove: {
    id: "features.sequence.style.changed.blockStyleRemove",
    defaultMessage:
      "S'ha tret l'estil de bloc: el bloc torna a l'estil del document.",
    description:
      "Snackbar amb «Desfés» després de treure l'estil de bloc d'un bloc, al nivell «Bloc» de la columna de la vista",
  },
});

export default messages;
