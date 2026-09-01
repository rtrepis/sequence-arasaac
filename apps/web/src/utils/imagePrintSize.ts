// A quina mida s'imprimeix bé una imatge.
//
// El pes (500 KB, 120 KB) és una referència honesta però només per a qui sap
// què vol dir: qui prepara una seqüència de pictogrames no tria en kilobytes,
// tria en «que es vegi bé al full». Aquí es tradueix una cosa a l'altra.
//
// El criteri és el mateix que fa servir la impremta: 300 punts per polzada és
// on l'ull deixa de distingir el píxel. Per sota es comença a veure borrós, i
// per això la xifra que en surt es diu com un sostre («fins a») i mai com una
// mida recomanada.
import type { ImageQuality } from "@/types/ui";
import { IMAGE_QUALITY_PRESETS } from "./imageToBase64";

/** Densitat a partir de la qual una imatge impresa es veu nítida. */
export const GOOD_PRINT_DPI = 300;

const MM_PER_INCH = 25.4;

/**
 * Costat més gran, en centímetres, al qual una imatge d'aquests píxels encara
 * s'imprimeix nítida. S'arrodoneix a centímetres sencers: mig centímetre de
 * diferència no canvia cap decisió, i un decimal convidaria a llegir-ho com
 * una mesura exacta quan és un llindar.
 */
export const printableSizeCm = (pixels: number): number =>
  Math.max(1, Math.round((pixels / GOOD_PRINT_DPI) * (MM_PER_INCH / 10)));

/**
 * El mateix per a un nivell de qualitat, abans que la imatge existeixi: és el
 * que permet triar el nivell sabent què hi guanyes i què hi perds.
 *
 * El nivell «Impressió» (1.800 px → 15 cm) cobreix el pictograma més gran que
 * l'app pot imprimir (150,8 mm), que és per què continua sent el valor per
 * defecte.
 */
export const qualityPrintableSizeCm = (quality: ImageQuality): number =>
  printableSizeCm(IMAGE_QUALITY_PRESETS[quality].maxSidePx);
