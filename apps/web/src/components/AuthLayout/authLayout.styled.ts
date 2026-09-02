/**
 * Tokens de les pàgines d'autenticació (signup, recuperació i establiment de
 * contrasenya). Única font de veritat de com es reparteixen en pantalla.
 *
 * Són pàgines que es veuen **fora de l'app** —s'hi arriba des d'un enllaç d'un
 * correu o des de la benvinguda—, i sovint des del telèfon. Per això no hereten
 * cap dels layouts de dins (ni `SettingsPanelLayout`, que és exclusiu del modal
 * de configuracions) i tenen els seus tres tokens propis.
 */

/**
 * Amplada de la targeta del formulari.
 *
 * 460 px i no més: la literatura de formularis (una sola columna, una pregunta
 * per fila) recomana mantenir la línia curta perquè l'ull no hagi de saltar
 * entre etiqueta i camp. Amb els camps a tota l'amplada, passats els ~500 px un
 * camp de correu es fa més llarg que qualsevol correu que s'hi escriurà.
 */
export const AUTH_CARD_WIDTH = 460;

/**
 * Amplada de la columna d'arguments (marca, què hi guanyes, què cal saber).
 * Més estreta que la targeta a propòsit: és text de suport i ha de quedar clar
 * que el formulari és el que s'ha de fer.
 */
export const AUTH_ASIDE_WIDTH = 360;

/** Separació entre les dues columnes, en unitats d'espaiat del tema. */
export const AUTH_ZONE_GAP = 6;

/**
 * Breakpoint únic de la pàgina: per sota, una sola columna. És `md` (900 px)
 * perquè per sota les dues columnes deixarien la targeta a 400 px escassos amb
 * el text de suport encaixonat al costat, il·legibles totes dues.
 */
export const AUTH_LAYOUT_BREAKPOINT = "md" as const;

/**
 * Amplada màxima del conjunt. **Derivada, no escrita**: si una de les dues
 * columnes canvia, aquesta se n'assabenta (mateix criteri que
 * `SETTINGS_MAX_WIDTH` a l'estàndard de configuracions). El gap es passa a
 * píxels amb els 8 px per unitat del tema de MUI.
 */
export const AUTH_MAX_WIDTH =
  AUTH_CARD_WIDTH + AUTH_ASIDE_WIDTH + AUTH_ZONE_GAP * 8;
