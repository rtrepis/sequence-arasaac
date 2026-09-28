import { defineMessages } from "react-intl";

// Missatges de l'estil del document: el panell «Estil del document» i les seves
// accions, el bàner en obrir un document i el snackbar de desfer. Vegeu
// `docs/fonaments/sequencia-i-estil.md` (nomenclatura inclosa: «document» és el
// fitxer sencer, «seqüència» cadascuna de les que conté).
const messages = defineMessages({
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
    description: "Nom accessible del botó que tanca el bàner o el snackbar d'estil",
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
  pendingDefaultTitle: {
    id: "features.sequence.style.pendingDefault.title",
    defaultMessage: "Vols fer servir aquest estil per defecte?",
    description: "Pregunta en obrir un fitxer d'estil sense cap document obert",
  },
  pendingDefaultBody: {
    id: "features.sequence.style.pendingDefault.body",
    defaultMessage:
      "No hi ha cap document obert a què aplicar-lo. Si el fas servir per defecte, els documents nous el rebran en lloc de l'estil que tens ara.",
    description: "Explicació de què passa si s'accepta l'estil com a per defecte",
  },
  pendingDefaultConfirm: {
    id: "features.sequence.style.pendingDefault.confirm",
    defaultMessage: "Fes-lo servir per defecte",
    description: "Botó per acceptar l'estil del fitxer com a estil per defecte",
  },
});

export default messages;
