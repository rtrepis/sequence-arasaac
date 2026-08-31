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
      "Cada imatge nova ocuparà com a màxim {size}. Les que ja has pujat no canvien.",
    description: "Explicació del pes que ocupa cada nivell de qualitat",
  },
});

export default messages;
