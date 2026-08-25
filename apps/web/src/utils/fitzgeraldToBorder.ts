import { Border } from "../types/sequence";

/**
 * Color de la vora quan el pictograma no té classificació de Fitzgerald.
 *
 * Abans aquí hi havia `fitzgeraldColors.not`, una clau que no existeix a
 * `data/fitzgeraldColors`: resolia a `undefined`, el `borderColor` sortia sense
 * valor i el navegador el resolia com a `currentColor`. Es deixa escrit el que
 * ja passava —mateix dibuix a la pantalla— en comptes de triar un color nou pel
 * camí; quin ha de ser el color de debò és una decisió de producte (backlog C11).
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
