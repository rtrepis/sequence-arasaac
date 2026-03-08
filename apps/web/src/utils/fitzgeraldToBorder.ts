import fitzgeraldColors from "../data/fitzgeraldColors";
import { Border } from "../types/sequence";

const fitzgeraldToBorder = (fitzgerald: string | undefined, border: Border) => {
  const colorFitzgerald = fitzgerald ? fitzgerald : fitzgeraldColors.not;

  const colorBorder =
    border.color === "fitzgerald" ? colorFitzgerald : border.color;

  return {
    color: colorBorder,
    size: border.size,
    radius: border.radius,
  };
};

export default fitzgeraldToBorder;
