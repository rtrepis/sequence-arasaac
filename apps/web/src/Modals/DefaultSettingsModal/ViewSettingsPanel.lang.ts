import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelDescription: {
    id: "components.viewSettingsPanel.panelDescription",
    defaultMessage: "Configure the default display values when opening the view page.",
    description: "Text explicatiu del panell de configuració de la vista",
  },
  sectionPageFormat: {
    id: "components.viewSettingsPanel.sectionPageFormat",
    defaultMessage: "Page format",
    description: "Títol de la secció de format de pàgina al panell de vista",
  },
  sectionPictograms: {
    id: "components.viewSettingsPanel.sectionPictograms",
    defaultMessage: "Pictograms",
    description: "Títol de la secció de mida i alineació de pictogrames al panell de vista",
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
  reset: {
    id: "components.viewSettingsPanel.reset",
    defaultMessage: "Restore view",
    description: "Botó per restablir els valors de fàbrica de la configuració de vista",
  },
  tooltipReset: {
    id: "components.viewSettingsPanel.tooltipReset",
    defaultMessage: "Return view settings to factory values",
    description: "Tooltip del botó de restaurar la configuració de vista",
  },
});

export default messages;
