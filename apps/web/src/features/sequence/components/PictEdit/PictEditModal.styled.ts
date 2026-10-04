import { SxProps, Theme } from "@mui/material";
import { printColors, sheetSurface, sheetWarning } from "@/style/palette";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";

/**
 * Targeta de l'editor com a botó. `WebkitTouchCallout` i `userSelect` apaguen
 * el menú del sistema que iOS obre en mantenir el dit sobre la imatge
 * («Guardar imagen / Copiar»): allà no és una via a les accions del pictograma
 * —Safari no dispara mai `contextmenu`— sinó una resposta d'un altre programa
 * que sembla de l'app. Les accions hi arriben pel menú del diàleg d'edició.
 */
/**
 * Farciment del botó de la targeta: el de MUI, escrit aquí perquè la fila de
 * marques (`cardMarks`) es posa respecte de la cantonada de la targeta, que és
 * a aquesta distància de la vora del botó.
 */
const TRIGGER_PADDING = { block: 6, inline: 8 };

/** Diàmetre de les marques i quant mosseguen la vora exterior de la targeta */
const MARK_SIZE = 18;
const MARK_BITE = 7;

export const pictogramTrigger = {
  padding: `${TRIGGER_PADDING.block}px ${TRIGGER_PADDING.inline}px`,
  textTransform: "none",
  WebkitTouchCallout: "none",
  userSelect: "none",
};

/**
 * Fila de marques de la targeta a la graella d'edició: mossega la vora
 * exterior per la cantonada de baix a la dreta, que és buida amb qualsevol
 * posició del text i del número (el contingut va centrat).
 *
 * És germana del botó de la targeta i no filla: l'avís de text tallat és un
 * botó, i un botó no pot anar dins d'un altre. La de més a la dreta és sempre
 * «personalitzat»; l'avís s'hi posa al costat, i mai l'una damunt de l'altra.
 * Mai no s'imprimeix (i html2canvas la salta).
 */
export const cardMarks: SxProps<Theme> = {
  position: "absolute",
  right: TRIGGER_PADDING.inline - MARK_BITE,
  bottom: TRIGGER_PADDING.block - MARK_BITE,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  "@media print": { display: "none" },
};

/**
 * Marca «personalitzat»: una rodoneta dins de `cardMarks`.
 *
 * Negre sobre l'anella blanca del full: 21:1 amb el fons i amb qualsevol vora,
 * i no depèn del tema, perquè és damunt del full (`sheetSurface`). Informativa:
 * no rep el focus ni el ratolí.
 */
export const customizedMark: SxProps<Theme> = {
  width: MARK_SIZE,
  height: MARK_SIZE,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  color: sheetSurface,
  backgroundColor: printColors.text,
  boxShadow: `0 0 0 2px ${sheetSurface}`,
  pointerEvents: "none",
};

/**
 * Diana de l'avís de text tallat: els 44 px de qualsevol objectiu tàctil, amb
 * marges negatius perquè a la fila només ocupi el que es veu (la rodoneta). La
 * part de més cau damunt de la cantonada buida de la targeta.
 */
export const textOverflowHitArea: SxProps<Theme> = {
  width: APP_TOUCH_TARGET_MIN,
  height: APP_TOUCH_TARGET_MIN,
  margin: `${-(APP_TOUCH_TARGET_MIN - MARK_SIZE) / 2}px`,
  padding: 0,
};

/**
 * Marca «el text no hi cap» (B28): la mateixa rodoneta que «personalitzat», en
 * taronja d'avís i amb un signe d'exclamació. Forma i color, no només color.
 * Fixa en tots dos temes, perquè és damunt del full.
 */
export const textOverflowMark: SxProps<Theme> = {
  width: MARK_SIZE,
  height: MARK_SIZE,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  color: sheetSurface,
  backgroundColor: sheetWarning,
  boxShadow: `0 0 0 2px ${sheetSurface}`,
};

/**
 * Camp que edita el text damunt de la targeta de la graella: tapa el text de
 * la targeta, a dalt o a baix segons on el pinta. És damunt del full, i per
 * això no s'adapta al tema: paper blanc i lletra negra, com la targeta. El
 * contorn verd només diu on és el focus. La lletra, a 16 px com a mínim: amb
 * menys, Safari d'iOS amplia la pàgina en entrar-hi.
 */
export const cardTextEditor = (position: "top" | "bottom"): SxProps<Theme> => ({
  position: "absolute",
  insetInline: 12,
  ...(position === "top" ? { top: 10 } : { bottom: 10 }),
  zIndex: 1,
  paddingInline: 1,
  fontSize: 16,
  color: printColors.text,
  backgroundColor: sheetSurface,
  borderRadius: 1,
  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
  "& input": { textAlign: "center" },
});
