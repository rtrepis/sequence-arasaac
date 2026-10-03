import { defineMessages } from "react-intl";

/**
 * Els missatges del desat de la configuració viuen amb el hook que els mostra.
 *
 * Abans els demanava prestats al panell d'usuari del diàleg de configuració, i
 * això feia que una feature del backend depengués d'un component de la
 * interfície. L'identificador és el d'abans: és la clau de les traduccions, i
 * canviar-lo voldria dir tornar a traduir el missatge en cinc idiomes.
 */
const messages = defineMessages({
  saveSuccess: {
    id: "components.defaultSettings.userPanel.saveSuccess",
    defaultMessage: "User settings saved",
    description: "Snackbar quan els settings d'usuari s'han desat correctament",
  },
});

export default messages;
