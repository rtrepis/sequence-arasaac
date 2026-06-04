import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelDescription: {
    id: "components.viewSettingsPanel.panelDescription",
    defaultMessage: "Configure the default display values when opening the view page.",
    description: "Text explicatiu del panell de configuració de la vista",
  },
  orientationLandscape: {
    id: "components.viewSettingsPanel.orientationLandscape",
    defaultMessage: "Landscape",
    description: "Opció d'orientació horitzontal de la pàgina",
  },
  orientationPortrait: {
    id: "components.viewSettingsPanel.orientationPortrait",
    defaultMessage: "Portrait",
    description: "Opció d'orientació vertical de la pàgina",
  },
  apply: {
    id: "components.viewSettingsPanel.apply",
    defaultMessage: "Apply to current view",
    description: "Botó per aplicar els canvis de visualització a Redux immediatament",
  },
  applyHelper: {
    id: "components.viewSettingsPanel.applyHelper",
    defaultMessage: "Applies the values to the active view session without closing the settings.",
    description: "Text explicatiu del botó Apply",
  },
});

export default messages;
