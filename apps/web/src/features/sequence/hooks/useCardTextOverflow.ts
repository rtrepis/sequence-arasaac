// Detecta si el text d'una targeta sobresurt de la caixa i es talla (B28).
//
// Una paraula que no es pot partir es fa més ampla que la targeta, i la
// targeta retalla el que en sobresurt. Ni el navegador ni la impressió no ho
// avisen: només es veu si es mira la targeta de prop.
import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

/** Mida mínima de la lletra que permet l'ajust de mida (`SettingCardNumber`). */
export const MIN_FONT_SIZE = 0.5;
const FONT_SIZE_STEP = 0.1;

/**
 * Mida de lletra més gran, en passos de l'ajust, amb què el text hi cabria; o
 * `null` si no hi cap ni amb la mínima.
 *
 * L'amplada d'una paraula és proporcional a la mida de la lletra, i la caixa
 * del text i la lletra s'escalen igual amb la mida de la targeta: la proporció
 * que es mesura a la graella és la mateixa del paper.
 */
export const fittingFontSize = (
  currentSize: number,
  boxWidth: number,
  textWidth: number,
): number | null => {
  const raw = (currentSize * boxWidth) / textWidth;
  // Arrodonit avall al pas de l'ajust; l'èpsilon evita que 0,8 surti 0,7
  const size = Math.floor(raw / FONT_SIZE_STEP + 1e-9) * FONT_SIZE_STEP;
  const rounded = Math.round(size * 10) / 10;
  return rounded >= MIN_FONT_SIZE ? rounded : null;
};

export interface CardTextOverflow {
  /** Amplada de la caixa del text, en píxels */
  boxWidth: number;
  /** Amplada que ocupa el text, en píxels: més gran que la caixa */
  textWidth: number;
}

const sameOverflow = (
  a: CardTextOverflow | null,
  b: CardTextOverflow | null,
): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.boxWidth === b.boxWidth &&
    a.textWidth === b.textWidth);

/**
 * Mesura el text de la targeta que hi ha dins de `rootRef` (l'element marcat
 * amb `data-card-text`). Torna `null` si hi cap o si no n'hi ha.
 *
 * Es torna a mesurar a cada pintada —el text, la lletra o la mida poden haver
 * canviat— i quan acaba de carregar una font: amb la de reserva el text pot
 * cabre i amb la de debò no.
 */
export const useCardTextOverflow = (
  rootRef: RefObject<HTMLElement>,
): CardTextOverflow | null => {
  const [overflow, setOverflow] = useState<CardTextOverflow | null>(null);

  const measure = useCallback(() => {
    const text =
      rootRef.current?.querySelector<HTMLElement>("[data-card-text]");
    // Un píxel de marge: l'arrodoniment de subpíxels no és cap tall
    const next =
      text && text.scrollWidth > text.clientWidth + 1
        ? { boxWidth: text.clientWidth, textWidth: text.scrollWidth }
        : null;
    setOverflow((previous) => (sameOverflow(previous, next) ? previous : next));
  }, [rootRef]);

  // Sense dependències a propòsit: cada pintada de la targeta pot canviar-ho
  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    fonts?.addEventListener?.("loadingdone", measure);
    return () => fonts?.removeEventListener?.("loadingdone", measure);
  }, [measure]);

  return overflow;
};
