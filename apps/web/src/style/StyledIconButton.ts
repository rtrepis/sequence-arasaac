import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { APP_CORNER_RADIUS, APP_TOUCH_TARGET_MIN } from "./appShape";

/**
 * Botó només-icona de la casa: la cantonada dels toggles i la diana tàctil
 * mínima del WCAG, sempre.
 *
 * **El color no el posa ell**: qui el fa servir tria `color="inherit"` (la tinta
 * del tema) sobre paper o full, i `color="inherit"` també sobre el verd de la
 * NavBar, on la tinta ja és `primary.contrastText`. El que no pot fer mai és
 * quedar-se amb el `primary` per defecte: el verd de la casa sobre blanc es
 * queda a 2,1:1 i el mínim per a una icona és 3:1 (F11).
 */
const StyledIconButton = styled(IconButton)(() => ({
  borderRadius: `${APP_CORNER_RADIUS}px`,
  minWidth: APP_TOUCH_TARGET_MIN,
  minHeight: APP_TOUCH_TARGET_MIN,
}));

export default StyledIconButton;
