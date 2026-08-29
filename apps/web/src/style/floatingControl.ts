import { alpha, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";
import { APP_CONTROL_BORDER_WIDTH, APP_CORNER_RADIUS } from "./appShape";

/**
 * Ombra dels controls de la casa (toggle seleccionat o amb el ratolí a sobre).
 * Conserva la geometria de sempre, però el color surt del tema: el gris fix que
 * hi havia (`#A6A6A6`) no feia d'ombra de res en tema fosc.
 */
export const controlGlow = (theme: Theme): string =>
  `0px 0px 10px 1px ${alpha(theme.palette.text.primary, 0.35)}`;

/** Intensitat del tint sobre el paper, la mateixa del toggle seleccionat. */
const TINT_OPACITY = 0.2;
/** Tint del passi del ratolí: el mateix salt que fa el toggle en `:hover`. */
const TINT_OPACITY_HOVER = 0.35;

/** Capa de tint opaca: un degradat pla del mateix color a banda i banda. */
const tintLayer = (color: string, opacity: number): string => {
  const tint = alpha(color, opacity);

  return `linear-gradient(${tint}, ${tint})`;
};

/**
 * Aspecte de **control flotant** de la casa: la mateixa forma que un toggle
 * seleccionat (radi 20, vora d'1,75 px i tint del color), però **opac**.
 *
 * Ha de ser opac perquè, a diferència del toggle, no sura sobre el gris de
 * configuració sinó sobre el full: amb el tint transparent s'hi veurien passar
 * els pictogrames per sota i la icona quedaria il·legible justament sobre el
 * contingut. El tint es pinta com a capa de `backgroundImage` damunt del paper,
 * de manera que el color resultant és exactament el del toggle seleccionat i
 * alhora no deixa veure res del que hi ha a sota.
 */
export const floatingControlSx =
  (
    color: "primary" | "error" = "primary",
  ): ((theme: Theme) => SystemStyleObject<Theme>) =>
  (theme: Theme) => ({
    borderRadius: `${APP_CORNER_RADIUS}px`,
    border: `${APP_CONTROL_BORDER_WIDTH}px solid ${theme.palette[color].main}`,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: tintLayer(theme.palette[color].main, TINT_OPACITY),
    // La tinta del tema, com al toggle: qui diu de quin color és el control són
    // la vora i el tint, no la icona
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      backgroundImage: tintLayer(theme.palette[color].main, TINT_OPACITY_HOVER),
    },
    // Amb el fons escrit a mà, el desactivat de MUI ja no es veuria: sense això
    // una fletxa que no porta enlloc es veuria igual que una que sí
    "&.Mui-disabled": {
      borderColor: theme.palette.action.disabled,
      backgroundImage: "none",
      color: theme.palette.text.disabled,
    },
  });
