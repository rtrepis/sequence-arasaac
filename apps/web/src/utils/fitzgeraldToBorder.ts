import { Border } from "../types/sequence";

/**
 * Última reserva del color de la vora quan no n'arriba cap. Ja no hauria de
 * passar: des del model v3 (C11 resolta), un pictograma sense categoria pren el
 * color `none` de l'estil del document, i la targeta el passa aquí. Es queda
 * `currentColor` per a qui cridi sense estil (una previsualització, un test).
 */
const NO_FITZGERALD_COLOR = "currentColor";

const fitzgeraldToBorder = (fitzgerald: string | undefined, border: Border) => {
  const colorFitzgerald = fitzgerald ? fitzgerald : NO_FITZGERALD_COLOR;

  const colorBorder =
    border.color === "fitzgerald" ? colorFitzgerald : border.color;

  return {
    color: colorBorder,
    size: border.size,
    radius: border.radius,
  };
};

export default fitzgeraldToBorder;
