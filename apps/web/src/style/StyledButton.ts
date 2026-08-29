import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { APP_CORNER_RADIUS } from "./appShape";

/**
 * Botó de la casa: la cantonada dels toggles, sense majúscules i en negreta.
 * És el botó de tots els peus de diàleg (vegeu `components/AppDialog/`).
 *
 * No hi ha cap `maxWidth`: el que en tenia un de 130 px era «Aplica a tots»,
 * i el límit ha anat a parar allà. Amb el límit aquí, una etiqueta llarga
 * («Descarrega-ho abans») es partia en tres línies a qualsevol peu.
 */
const StyledButton = styled(Button)(() => ({
  borderRadius: `${APP_CORNER_RADIUS}px`,
  textTransform: "none",
  fontWeight: "bold",
  whiteSpace: "nowrap",
}));

export default StyledButton;
