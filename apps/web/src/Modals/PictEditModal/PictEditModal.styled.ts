import { SxProps, Theme } from "@mui/material";
import { printColors, sheetSurface } from "@/style/palette";

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

/**
 * Marca «personalitzat» de la targeta a la graella d'edició: una rodoneta que
 * mossega la vora exterior per la cantonada de baix a la dreta, que és buida
 * amb qualsevol posició del text i del número (el contingut va centrat).
 *
 * Negre sobre l'anella blanca del full: 21:1 amb el fons i amb qualsevol vora,
 * i no depèn del tema, perquè és damunt del full (`sheetSurface`). Informativa:
 * no rep el focus ni el ratolí. Mai no s'imprimeix (i html2canvas la salta).
 */
export const customizedMark: SxProps<Theme> = {
  position: "absolute",
  right: -7,
  bottom: -7,
  width: 18,
  height: 18,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  color: sheetSurface,
  backgroundColor: printColors.text,
  boxShadow: `0 0 0 2px ${sheetSurface}`,
  pointerEvents: "none",
  "@media print": { display: "none" },
};
