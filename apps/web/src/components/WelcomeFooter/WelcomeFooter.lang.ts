import { defineMessages } from "react-intl";

// Textos d'atribució del peu de la pàgina d'inici. Venien de
// `CopyRightSpeedDial`, esborrat perquè ningú el renderitzava (C4 de
// l'auditoria d'UX); els `id` conserven el nom antic a propòsit, perquè
// canviar-los només rebatejaria les claus dels cinc fitxers de traducció.
const messages = defineMessages({
  license: {
    id: "components.copyRightDial.license.label",
    defaultMessage:
      "Author of the pictograms: Sergio Palao.\n Origen: ARASAAC (http://www.arasaac.org). License: CC (BY-NC-SA).",
    description: "license ",
  },
  auth: {
    id: "components.copyRightDial.auth.label",
    defaultMessage: `Design & all right reserved: Ramon Trepat & AraSaac.`,
    description: "Page auth",
  },
});

export default messages;
