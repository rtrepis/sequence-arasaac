import { SxProps, Theme } from "@mui/material";
import {
  APP_CORNER_RADIUS,
  FLOATING_CONTROL_CLEARANCE,
} from "@/style/appShape";

/**
 * Posició de qualsevol `Snackbar` de l'app.
 *
 * Per sota de `sm` el `Snackbar` de MUI s'estén de banda a banda i taparia el
 * botó d'estat, justament quan l'usuari acaba de desar i pot voler mirar on ha
 * anat a parar la feina (troballa C7). Es mou l'avís i no el botó perquè el
 * botó és permanent i l'avís és de pas.
 *
 * La separació surt dels tokens de forma: abans era un 72 escrit a mà a partir
 * dels 48 px del botó, i quan el botó ha canviat de mida el número ha deixat de
 * quadrar sense que res ho digués.
 */
export const floatingSnackbarSx: SxProps<Theme> = (theme) => ({
  [theme.breakpoints.down("sm")]: { right: FLOATING_CONTROL_CLEARANCE },
});

/**
 * Aparença única de l'avís flotant: vora de severitat sobre paper opac i la
 * cantonada de la casa.
 *
 * Opac perquè l'`outlined` de MUI és transparent i, sobre el full, el text
 * quedaria il·legible. La severitat la diuen la vora i la icona, no un fons de
 * color: així els tres avisos de l'app es veuen iguals i cap no sembla d'una
 * altra biblioteca.
 */
export const floatingNoticeSx: SxProps<Theme> = (theme) => ({
  width: "100%",
  bgcolor: "background.paper",
  borderRadius: `${APP_CORNER_RADIUS}px`,
  boxShadow: theme.shadows[6],
});
