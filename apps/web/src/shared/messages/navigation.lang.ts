import { defineMessages } from "react-intl";

/**
 * Noms de les dues pàgines principals, compartits per tots els punts que hi
 * porten (els tabs de `TabsEditView` i el drawer de navegació). Un sol parell
 * de missatges: el mateix destí no pot dir-se de dues maneres segons per on
 * s'hi arribi.
 */
const navigationMessages = defineMessages({
  edit: {
    id: "shared.navigation.edit",
    defaultMessage: "Edit",
    description: "Nom de la pàgina d'edició de seqüències",
  },
  view: {
    id: "shared.navigation.view",
    defaultMessage: "View",
    description: "Nom de la pàgina de visualització de seqüències",
  },
});

export default navigationMessages;
