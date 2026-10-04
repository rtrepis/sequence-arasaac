import { defineMessages } from "react-intl";

// Missatges de l'estil del document: el panell «Estil del document» i les seves
// accions, el bàner en obrir un document i el snackbar de desfer. Vegeu
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
    defaultMessage:
      "No portava estil propi, i hi hem aplicat el teu estil per defecte.",
    description:
      "S'afegeix al bàner de document antic quan el fitxer no portava estil (o no sencer)",
  },
  noticeNewerVersion: {
    id: "features.sequence.style.notice.newerVersion",
    defaultMessage:
      "Aquest document s'ha creat amb una versió més nova de SequenciAAC. Pot ser que alguna cosa no es vegi bé. Si el deses aquí, es podrien perdre canvis.",
    description:
      "Bàner d'avís en obrir un document d'una versió de l'app més nova que la d'ara",
  },
  panelTitle: {
    id: "features.sequence.style.panel.title",
    defaultMessage: "Estil del document",
    description:
      "Títol del panell d'estil i del botó del bàner que hi porta. L'estil s'aplica a totes les seqüències del document",
  },
  applyUserDefault: {
    id: "features.sequence.style.applyUserDefault",
    defaultMessage: "Aplica el meu estil per defecte",
    description:
      "Acció que aplica l'estil per defecte de l'usuari al document obert (es pot desfer)",
  },
  applyUserDefaultTooltip: {
    id: "features.sequence.style.applyUserDefault.tooltip",
    defaultMessage:
      "Torna totes les seqüències del document al teu estil per defecte. Es pot desfer.",
    description: "Ajuda del botó «Aplica el meu estil per defecte» de la vista",
  },
  loadStyleFile: {
    id: "features.sequence.style.loadStyleFile",
    defaultMessage: "Carrega un estil des d'un fitxer…",
    description:
      "Acció que aplica al document l'estil d'un fitxer .saacstyle o d'un altre document .saac",
  },
  setAsDefault: {
    id: "features.sequence.style.setAsDefault",
    defaultMessage: "Desa com a estil per defecte",
    description:
      "Acció que fa que l'estil del document sigui el que reben els documents nous",
  },
  setAsDefaultSuccess: {
    id: "features.sequence.style.setAsDefault.success",
    defaultMessage: "S'ha desat com a estil per defecte",
    description: "Confirmació de «Desa com a estil per defecte»",
  },
  saveStyleFile: {
    id: "features.sequence.style.saveStyleFile",
    defaultMessage: "Desa l'estil en un fitxer…",
    description:
      "Acció que obre el diàleg per desar només l'estil del document en un fitxer .saacstyle",
  },
  styleActions: {
    id: "features.sequence.style.actions",
    defaultMessage: "Accions d'estil",
    description:
      "Nom accessible del botó «⋯» que obre el menú amb les accions d'estil en mòbil",
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
  changedUserDefault: {
    id: "features.sequence.style.changed.userDefault",
    defaultMessage: "S'ha aplicat el teu estil per defecte al document.",
    description: "Snackbar després d'aplicar l'estil per defecte al document",
  },
  changedFile: {
    id: "features.sequence.style.changed.file",
    defaultMessage: "S'ha aplicat l'estil del fitxer al document.",
    description: "Snackbar després d'aplicar al document l'estil d'un fitxer",
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
    defaultMessage: "S'ha desfet el canvi d'estil",
    description: "Confirmació després de desfer un canvi d'estil",
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
      "Pots aplicar-lo al document obert, o fer-lo el teu estil per defecte, que és el que reben els documents nous.",
    description:
      "Explicació del diàleg de fitxer d'estil quan hi ha un document obert",
  },
  styleFileApply: {
    id: "features.sequence.style.styleFileOpened.apply",
    defaultMessage: "Aplica'l a aquest document",
    description:
      "Botó que aplica l'estil del fitxer al document obert (es pot desfer)",
  },
  styleFileMakeDefault: {
    id: "features.sequence.style.styleFileOpened.makeDefault",
    defaultMessage: "Fes-lo el meu estil per defecte",
    description:
      "Botó que fa de l'estil del fitxer l'estil per defecte de l'usuari",
  },
  pendingDefaultBody: {
    id: "features.sequence.style.pendingDefault.body",
    defaultMessage:
      "No hi ha cap document obert a què aplicar-lo. Si el fas servir per defecte, els documents nous el rebran en lloc de l'estil que tens ara.",
    description:
      "Explicació de què passa si s'accepta l'estil com a per defecte",
  },
});

export default messages;
