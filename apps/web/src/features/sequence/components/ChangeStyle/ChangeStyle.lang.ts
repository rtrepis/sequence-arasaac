import { defineMessages } from "react-intl";

// Missatges de l'estil de la seqüència: «Canvia l'estil», l'avís en obrir una
// seqüència i «Desa com a estil per defecte». Vegeu
// `docs/fonaments/sequencia-i-estil.md`.
const messages = defineMessages({
  changeStyle: {
    id: "features.sequence.style.changeStyle",
    defaultMessage: "Canvia l'estil",
    description:
      "Botó i títol del diàleg per triar un altre estil per a la seqüència oberta",
  },
  changeStyleTooltip: {
    id: "features.sequence.style.changeStyle.tooltip",
    defaultMessage:
      "Tria un altre estil per a aquesta seqüència. Es pot desfer.",
    description: "Ajuda del botó «Canvia l'estil»",
  },
  dialogIntro: {
    id: "features.sequence.style.dialog.intro",
    defaultMessage:
      "Tria amb quin estil vols veure aquesta seqüència. Ho podràs desfer, i el fitxer no canvia fins que el desis.",
    description: "Explicació del diàleg «Canvia l'estil»",
  },
  optionUserDefault: {
    id: "features.sequence.style.option.userDefault",
    defaultMessage: "El meu estil per defecte",
    description:
      "Opció de «Canvia l'estil»: aplicar l'estil per defecte de l'usuari",
  },
  optionUserDefaultHelp: {
    id: "features.sequence.style.option.userDefault.help",
    defaultMessage: "El que reben les seqüències noves.",
    description: "Explicació de l'opció «El meu estil per defecte»",
  },
  optionFile: {
    id: "features.sequence.style.option.file",
    defaultMessage: "Carrega un estil…",
    description: "Opció de «Canvia l'estil»: aplicar l'estil d'un fitxer",
  },
  optionFileHelp: {
    id: "features.sequence.style.option.file.help",
    defaultMessage:
      "D'un fitxer d'estil (.saacstyle) o d'una altra seqüència (.saac).",
    description: "Explicació de l'opció «Carrega un estil…»",
  },
  noticeOwnStyle: {
    id: "features.sequence.style.notice.ownStyle",
    defaultMessage: "Aquesta seqüència té el seu propi estil.",
    description:
      "Avís en obrir una seqüència amb un estil diferent de l'estil per defecte de l'usuari",
  },
  noticeUnavailableFonts: {
    id: "features.sequence.style.notice.unavailableFonts",
    defaultMessage:
      "Algunes fonts no estan disponibles en aquest dispositiu ({fonts}): es mostren amb una font de reserva.",
    description:
      "Avís en obrir una seqüència que fa servir fonts que el dispositiu no té. {fonts} és la llista de noms",
  },
  noticeChangedUserDefault: {
    id: "features.sequence.style.notice.changed.userDefault",
    defaultMessage:
      "S'ha aplicat el teu estil per defecte a aquesta seqüència.",
    description: "Avís després de canviar l'estil a l'estil per defecte",
  },
  noticeChangedFile: {
    id: "features.sequence.style.notice.changed.file",
    defaultMessage: "S'ha aplicat l'estil del fitxer a aquesta seqüència.",
    description: "Avís després de canviar l'estil a un de carregat d'un fitxer",
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
  setAsDefault: {
    id: "features.sequence.style.setAsDefault",
    defaultMessage: "Desa com a estil per defecte",
    description:
      "Botó que fa que un estil sigui el que reben les seqüències noves",
  },
  setAsDefaultSuccess: {
    id: "features.sequence.style.setAsDefault.success",
    defaultMessage: "S'ha desat com a estil per defecte",
    description: "Confirmació de «Desa com a estil per defecte»",
  },
  closeNotice: {
    id: "features.sequence.style.notice.close",
    defaultMessage: "Tanca l'avís",
    description: "Nom accessible del botó que tanca l'avís d'estil",
  },
  pendingDefaultTitle: {
    id: "features.sequence.style.pendingDefault.title",
    defaultMessage: "Vols fer servir aquest estil per defecte?",
    description:
      "Pregunta en obrir un fitxer d'estil sense cap seqüència oberta",
  },
  pendingDefaultBody: {
    id: "features.sequence.style.pendingDefault.body",
    defaultMessage:
      "No hi ha cap seqüència oberta a què aplicar-lo. Si el fas servir per defecte, les seqüències noves el rebran en lloc de l'estil que tens ara.",
    description:
      "Explicació de què passa si s'accepta l'estil com a per defecte",
  },
  pendingDefaultConfirm: {
    id: "features.sequence.style.pendingDefault.confirm",
    defaultMessage: "Fes-lo servir per defecte",
    description: "Botó per acceptar l'estil del fitxer com a estil per defecte",
  },
  panelTitle: {
    id: "features.sequence.style.panel.title",
    defaultMessage: "Estil d'aquesta seqüència",
    description:
      "Títol del panell de pictogrames de la configuració: diu que els canvis són per a la seqüència oberta",
  },
});

export default messages;
