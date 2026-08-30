import { SxProps, Theme } from "@mui/material";

/**
 * Estils canònics de l'estàndard de configuracions.
 * Font única de veritat per a l'espaiat i la separació entre ajustos
 * a tots els tabs del modal de configuracions per defecte.
 */

/**
 * Breakpoint de ruptura entre el comportament de tauleta/escriptori i el de mòbil.
 * Per sota, les files s'apilen (títol a dalt, control a sota a tota l'amplada);
 * per sobre, títol a l'esquerra i control a la dreta.
 */
export const SETTINGS_MOBILE_BREAKPOINT = "sm";

/** Separació vertical (gap MUI) entre files d'ajustos dins d'una columna de controls. */
export const SETTINGS_ROW_GAP = 1;

/** Separació vertical (gap MUI) entre les dues zones (preview / controls) en escriptori. */
export const SETTINGS_ZONE_GAP = 4;

/** Amplada màxima del panell centrat (estàndard tauleta). */
export const SETTINGS_MAX_WIDTH = 900;

/**
 * Indentació (paddingLeft, gap MUI) del contingut d'una secció respecte al seu SectionTitle.
 * Reduïda en mòbil per recuperar amplada útil sense perdre la lectura d'esquema.
 */
export const SETTINGS_INDENT = { xs: 1, sm: 3 };

/**
 * Alçada (px) de la barra superior del diàleg de configuracions. És l'alçada
 * real del `Toolbar` (el `minHeight` que li posa el tema), no la de l'`AppBar`,
 * que declara 42 i acaba fent-ne 50.
 */
export const SETTINGS_DIALOG_APPBAR_HEIGHT = 50;

/**
 * Aire entre la barra superior i el contingut del panell. Sense aquest marge, en
 * mòbil el primer element quedava a sis píxels de la barra i el panell semblava
 * enganxat a sota d'un bloc verd.
 */
export const SETTINGS_CONTENT_TOP_GAP = 3;

/**
 * Desplaçament vertical (px) del preview sticky en mòbil: l'AppBar del diàleg de
 * configuracions és `position: fixed` per sota de `md`, i sense aquest offset el
 * preview lliscaria per sota de la barra. És **exactament** l'alçada de la barra:
 * amb un píxel de més, el contingut que passa per darrere de la mostra enganxada
 * s'entreveu per la franja que queda entre les dues. L'aire es fa amb el padding
 * de dins de la mostra, que sí que va pintat.
 */
export const SETTINGS_APPBAR_OFFSET = SETTINGS_DIALOG_APPBAR_HEIGHT;

/**
 * Alçada màxima de la mostra en mòbil: acota-la perquè no es mengi la pantalla
 * i deixi els controls fora de vista. S'aplica sempre a la mostra, també quan va
 * acompanyada d'una llista (`previewAside`) — allà la que no s'acota és la
 * llista, que queda en flux normal i sense scroll intern.
 */
export const SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT = "35vh";

/**
 * Desplaçament vertical (px) del preview sticky en tauleta/escriptori: per sobre
 * de `md` l'AppBar del diàleg és `position: relative` i marxa amb l'scroll, així
 * que només cal un marge d'aire respecte a la vora superior del diàleg.
 */
export const SETTINGS_PREVIEW_STICKY_TOP = 16;

/**
 * Fila d'un ajust individual: només padding vertical per al ritme.
 * La separació visual entre ajustos ve del `gap` de la columna; el divisor
 * s'usa exclusivament sota el `SectionTitle` (agrupació), no entre files.
 */
export const settingRow: SxProps<Theme> = {
  paddingBlock: 0.5,
};

/**
 * Variant en línia de {@link settingRow}: títol a l'esquerra i control a la dreta.
 * Per sota de {@link SETTINGS_MOBILE_BREAKPOINT} la fila s'apila (títol a dalt,
 * control a sota) de forma deliberada: en pantalla estreta un grup de toggles
 * llarg (pell, cabell) no cap mai al costat del títol.
 *
 * **El que es parteix és el títol, no la fila** (`nowrap`). Amb `wrap`, el
 * navegador reparteix els elements per línies mirant l'amplada que voldrien
 * tenir, **abans** de deixar-los encongir: a la columna de la pàgina de vista,
 * que dona 289 px per fila, «Espai de pictogrames» (194) més el control (150)
 * sumaven més que la fila i el control queia a sota, mentre que «Mida» (43) es
 * quedava al costat. El resultat era una columna irregular on cada ajust
 * s'ensenyava d'una manera, i que canviava sol en canviar d'idioma o en créixer
 * un control. Sense `wrap`, l'encongiment sí que s'aplica: el títol es reparteix
 * en dues línies i el control es queda sempre al mateix lloc.
 */
export const settingRowInline: SxProps<Theme> = {
  ...settingRow,
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "nowrap",
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  columnGap: 2,
  rowGap: 1,
};

/** Amplada mínima (px) del control d'una fila, perquè sliders no quedin inusables en pantalles estretes. */
export const SETTINGS_CONTROL_MIN_WIDTH = 150;

/**
 * Amplada del control a la dreta d'una fila `settingRowInline`: com a màxim 1/3
 * del contenidor, amb un mínim de {@link SETTINGS_CONTROL_MIN_WIDTH}px de seguretat.
 * En mòbil, on la fila està apilada, el control ocupa tota l'amplada disponible
 * (el mínim de seguretat només té sentit quan comparteix línia amb el títol).
 * Aplica's a select/slider/textfield; els grups de `StyledToggleButtonGroup` en
 * queden exempts perquè ja són compactes per si mateixos.
 */
export const settingControlWidth: SxProps<Theme> = {
  flex: "1 1 auto",
  width: { xs: "100%", sm: "auto" },
  maxWidth: { xs: "100%", sm: "33%" },
  minWidth: { xs: 0, sm: SETTINGS_CONTROL_MIN_WIDTH },
};
