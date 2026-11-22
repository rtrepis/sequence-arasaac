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
  changedFitTextSequence: {
    id: "features.sequence.style.changed.fitTextSequence",
    defaultMessage:
      "S'ha reduït la lletra de l'estil d'aquesta seqüència perquè el text hi càpiga.",
    description:
      "Snackbar després de reduir la lletra de l'estil propi de la seqüència des de l'avís «el text no hi cap» (es pot desfer)",
  },
  changedFitTextDocument: {
    id: "features.sequence.style.changed.fitTextDocument",
    defaultMessage:
      "S'ha reduït la lletra de tot el document perquè el text hi càpiga.",
    description:
      "Snackbar després de reduir la lletra de l'estil del document des de l'avís «el text no hi cap» (es pot desfer)",
  },
  changedAdaptScreen: {
    id: "features.sequence.style.changed.adaptScreen",
    defaultMessage: "S'ha adaptat el full a aquesta pantalla.",
    description:
      "Snackbar amb «Desfés» en adaptar un document de pantalla sencera a la pantalla d'ara, d'una altra forma: el full canvia de forma i els blocs s'hi recol·loquen",
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
      "Pots fer-lo el teu estil: el reben els documents nous, i el pots triar a la Galeria d'estils d'un document obert.",
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
  changedResetSequence: {
    id: "features.sequence.style.changed.resetSequence",
    defaultMessage:
      "S'han restablert els pictogrames de la seqüència, a tots els blocs on surt.",
    description:
      "Snackbar amb «Desfés» després de «Restableix els pictogrames d'aquesta seqüència» del menú «⋯» d'un bloc: se'n treuen els retocs, i canvien tots els blocs on surt la seqüència",
  },
  changedSequenceStyle: {
    id: "features.sequence.style.changed.sequenceStyle",
    defaultMessage: "La seqüència fa servir «{name}».",
    description:
      "Snackbar amb «Desfés» després de triar un estil per a una seqüència a la Galeria d'estils",
  },
  changedSequenceStyleDocument: {
    id: "features.sequence.style.changed.sequenceStyleDocument",
    defaultMessage: "La seqüència torna a l'estil del document («{name}»).",
    description:
      "Snackbar amb «Desfés» després de triar «L'estil del document» a la Galeria d'estils; {name} és el nom de l'estil del document",
  },
  changedBlockStyle: {
    id: "features.sequence.style.changed.blockStyle",
    defaultMessage:
      "{common, select, true {El bloc fa servir «{name}», a totes les pàgines.} other {El bloc fa servir «{name}».}}",
    description:
      "Snackbar amb «Desfés» després de triar un estil per a un bloc a la Galeria d'estils (només aquell bloc). Si el bloc és comú, el canvi es veu a totes les pàgines",
  },
  changedBlockStyleSequence: {
    id: "features.sequence.style.changed.blockStyleSequence",
    defaultMessage:
      "{common, select, true {El bloc torna a l'estil de la seqüència («{name}»), a totes les pàgines.} other {El bloc torna a l'estil de la seqüència («{name}»).}}",
    description:
      "Snackbar amb «Desfés» després de «Torna a l'estil de la seqüència» (o la primera opció de la galeria) d'un bloc; {name} és l'estil de la seqüència",
  },
  changedSequenceStyleRetouched: {
    id: "features.sequence.style.changed.sequenceStyleRetouched",
    defaultMessage:
      "{count, plural, one {# pictograma conserva els seus retocs.} other {# pictogrames conserven els seus retocs.}}",
    description:
      "Segona frase del snackbar de triar l'estil d'una seqüència: els pictogrames amb retocs propis no canvien en el que han retocat",
  },
  changedSequenceStyleUnchangedBlocks: {
    id: "features.sequence.style.changed.sequenceStyleUnchangedBlocks",
    defaultMessage:
      "{count, plural, one {# bloc té un altre estil i no ha canviat.} other {# blocs tenen un altre estil i no han canviat.}}",
    description:
      "Frase del snackbar de triar l'estil d'una seqüència: els blocs amb un estil reassignat es queden el seu",
  },
  removeRetouches: {
    id: "features.sequence.style.removeRetouches",
    defaultMessage: "Treu els retocs",
    description:
      "Botó del snackbar de triar l'estil d'una seqüència: treu els retocs de tots els seus pictogrames",
  },
  changedSequenceRetouchesRemoved: {
    id: "features.sequence.style.changed.sequenceRetouchesRemoved",
    defaultMessage:
      "S'han tret els retocs dels pictogrames de la seqüència, a tots els blocs on surt.",
    description:
      "Snackbar amb «Desfés» després de «Treu els retocs»: el «Desfés» torna també l'estil d'abans",
  },
});

export default messages;
