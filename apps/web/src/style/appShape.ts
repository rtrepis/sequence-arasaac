/**
 * Tokens de forma de SequenciAAC — única font de veritat del radi, del gruix de
 * vora i de la mida dels controls de la casa.
 *
 * El toggle arrodonit (55×55, radi 20) és la marca visual de l'app. El mateix
 * radi el porten els botons, els diàlegs, els avisos flotants i el botó d'estat:
 * tot el que sura sobre la pàgina té la mateixa cantonada que els controls que
 * hi ha a sota. Fins ara el 20 vivia copiat a `StyledToggleButtonGroup`, a
 * `StyledButton` i dins d'un `sx` del modal d'edició.
 *
 * Vegeu `docs/ESTANDARD-capes-flotants.md`.
 */

/** Radi de cantonada de la casa, en píxels. */
export const APP_CORNER_RADIUS = 20;

/** Gruix de la vora dels controls de la casa (toggles, botó flotant). */
export const APP_CONTROL_BORDER_WIDTH = 1.75;

/** Costat del control quadrat de la casa (toggle, botó flotant principal). */
export const APP_CONTROL_SIZE = 55;

/**
 * Diana tàctil mínima (px) del WCAG 2.5.5. El `small` d'un `Fab` de MUI es queda
 * a 40 i un `IconButton` sense icona gran, a 40 també: per sota d'aquest valor,
 * en una app que es fa servir amb el dit i sovint amb poca precisió, el botó
 * existeix però no s'encerta.
 */
export const APP_TOUCH_TARGET_MIN = 44;

/** Separació de qualsevol capa flotant respecte del cantó de la finestra. */
export const FLOATING_EDGE_GAP = 16;

/**
 * Amplada que un avís del peu ha de deixar lliure a la dreta per no tapar el
 * botó d'estat. Es calcula i no s'escriu a mà: si el botó canvia de mida,
 * l'avís se n'assabenta (abans era un 72 derivat a mà dels 48 px del botó).
 */
export const FLOATING_CONTROL_CLEARANCE =
  FLOATING_EDGE_GAP + APP_CONTROL_SIZE + 8;

/**
 * Espai que el contingut reserva al seu final perquè el botó flotant no tapi
 * l'última fila de pictogrames. La capa flotant no empeny res: només s'assegura
 * que tot el que hi ha a sota es pugui arribar a veure amb l'scroll.
 */
export const FLOATING_BOTTOM_INSET = FLOATING_EDGE_GAP * 2 + APP_CONTROL_SIZE;
