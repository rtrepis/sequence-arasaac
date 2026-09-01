import { defineMessages } from "react-intl";

const messages = defineMessages({
  cardTitle: {
    id: "components.settingCardImageQuality.cardTitle",
    defaultMessage: "Qualitat de les imatges",
    description: "Títol de la fila que tria la qualitat de les imatges pujades",
  },
  ariaLabel: {
    id: "components.settingCardImageQuality.ariaLabel",
    defaultMessage: "Qualitat de les imatges que puges",
    description: "Nom accessible del grup de botons de qualitat",
  },
  print: {
    id: "components.settingCardImageQuality.print",
    defaultMessage: "Impressió",
    description: "Nivell de qualitat màxim, per imprimir a mida gran",
  },
  standard: {
    id: "components.settingCardImageQuality.standard",
    defaultMessage: "Estàndard",
    description: "Nivell de qualitat intermedi",
  },
  compact: {
    id: "components.settingCardImageQuality.compact",
    defaultMessage: "Compacta",
    description: "Nivell de qualitat que ocupa menys espai",
  },
  helper: {
    id: "components.settingCardImageQuality.helper",
    defaultMessage:
      "Les imatges noves es veuran bé impreses fins a {width} d'ample i ocuparan com a màxim {size} cadascuna. Impreses més grans, es veuran borroses.",
    description:
      "Explicació del nivell de qualitat: fins a quina mida s'imprimeix bé i quant ocupa",
  },
  optionHint: {
    id: "components.settingCardImageQuality.optionHint",
    defaultMessage: "Es veu bé imprès fins a {width} d'ample",
    description: "Ajuda de cada nivell: fins a quina mida impresa es veu bé",
  },
  existingUnchanged: {
    id: "components.settingCardImageQuality.existingUnchanged",
    defaultMessage: "Les que ja has pujat no canvien.",
    description: "La qualitat només val per a les imatges noves",
  },
  existingResizable: {
    id: "components.settingCardImageQuality.existingResizable",
    defaultMessage:
      "Les que ja has pujat no canvien, però les pots canviar de mida a «L'espai del teu compte».",
    description:
      "La qualitat només val per a les imatges noves, i on canviar les que ja hi són",
  },
});

export default messages;
