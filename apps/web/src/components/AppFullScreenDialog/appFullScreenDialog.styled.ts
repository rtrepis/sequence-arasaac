import { SxProps, Theme } from "@mui/material";
import { APP_TAB_LABEL_BREAKPOINT } from "@components/AppTabs";

/**
 * Alçada de la barra superior d'un diàleg a pantalla completa.
 *
 * Única font de veritat: per sota de `md` la barra és `position: fixed` i no
 * ocupa lloc, i tot el que s'hi ha d'apartar —el buit de sota la barra, la
 * mostra enganxada dels panells— surt d'aquí. Amb el número escrit a cada
 * lloc, canviar la barra deixava el contingut mig tapat sense que res ho digués.
 */
export const APP_FULLSCREEN_APPBAR_HEIGHT = 50;

/** La barra: fixa en mòbil, en flux a partir de `md`. */
export const appFullScreenAppBar: SxProps<Theme> = {
  position: { xs: "fixed", md: "relative" },
  height: `${APP_FULLSCREEN_APPBAR_HEIGHT - 8}px`,
};

export const appFullScreenToolbar: SxProps<Theme> = {
  minHeight: `${APP_FULLSCREEN_APPBAR_HEIGHT}px`,
};

/**
 * El títol cedeix l'amplada als tabs en pantalla petita: el nom del diàleg es
 * manté a l'`aria-label`, i el del tab actiu, al propi tab seleccionat.
 */
export const appFullScreenTitle: SxProps<Theme> = {
  ml: 2,
  mr: 3,
  display: { xs: "none", [APP_TAB_LABEL_BREAKPOINT]: "block" },
};

/**
 * Buit de l'alçada exacta de la barra, només mentre la barra és fixa: sense
 * ell, el contingut hi començava a sis píxels i semblava enganxat sota un
 * bloc verd.
 */
export const appFullScreenAppBarSpacer: SxProps<Theme> = {
  height: APP_FULLSCREEN_APPBAR_HEIGHT,
  display: { md: "none" },
};
