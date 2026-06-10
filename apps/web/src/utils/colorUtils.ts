/**
 * Retorna true si el color hex té una lluminàcia baixa (color fosc).
 * Suporta formats #RGB i #RRGGBB. Retorna false per a formats no reconeguts.
 */
export const isColorDark = (hex: string): boolean => {
  const clean = hex.replace("#", "");

  let r: number;
  let g: number;
  let b: number;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  } else {
    return false;
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.4;
};

/**
 * Retorna el color adaptat per a pantalla: si el tema és fosc i el color és fosc,
 * retorna blanc per garantir llegibilitat. Per a impressió, usar sempre el color original.
 */
export const getDisplayColor = (color: string, isDark: boolean): string =>
  isDark && isColorDark(color) ? "#ffffff" : color;
