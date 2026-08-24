export const circlePictogramNumber = {
  backgroundColor: "primary.main",
  borderRadius: "50%",
  color: "primary.contrastText",
  minWidth: "2.75rem",
  textAlign: "center",
};

/**
 * Targeta de l'editor com a botó. `WebkitTouchCallout` i `userSelect` apaguen
 * el menú del sistema que iOS obre en mantenir el dit sobre la imatge
 * («Guardar imagen / Copiar»): allà no és una via a les accions del pictograma
 * —Safari no dispara mai `contextmenu`— sinó una resposta d'un altre programa
 * que sembla de l'app. Les accions hi arriben pel menú del diàleg d'edició.
 */
export const pictogramTrigger = {
  textTransform: "none",
  WebkitTouchCallout: "none",
  userSelect: "none",
};
