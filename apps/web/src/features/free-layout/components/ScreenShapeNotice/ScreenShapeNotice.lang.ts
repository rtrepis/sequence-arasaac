import { defineMessages } from "react-intl";

const messages = defineMessages({
  notice: {
    id: "features.freeLayout.screenShape.notice",
    defaultMessage:
      "This document was made for a screen with a different shape. The sheet is shown whole, with margins.",
    description:
      "Bàner de la vista: el document és de pantalla sencera i es va fer en una pantalla d'una altra forma (proporció) que la d'ara. El full es veu sencer i encongit, amb vores als costats o a dalt i a baix",
  },
  adapt: {
    id: "features.freeLayout.screenShape.adapt",
    defaultMessage: "Adapt it to this screen",
    description:
      "Botó del bàner de la pantalla d'una altra forma: el full passa a tenir la forma d'aquesta pantalla i els blocs s'hi recol·loquen (es pot desfer)",
  },
});

export default messages;
