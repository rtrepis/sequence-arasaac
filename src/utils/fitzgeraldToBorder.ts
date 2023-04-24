import { Border } from "../types/sequence";

const fitzgeraldToBorder = (fitzgerald: string | undefined, border: Border) => {
  const colorFitzgerald = fitzgerald ? fitzgerald : "#999999";

  const colorBorder =
    border.color === "fitzgerald" ? colorFitzgerald : border.color;

  return {
    color: colorBorder,
    size: border.size,
    radius: border.radius,
  };
};

export default fitzgeraldToBorder;
