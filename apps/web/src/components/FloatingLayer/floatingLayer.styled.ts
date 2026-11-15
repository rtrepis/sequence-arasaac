import { SxProps, Theme } from "@mui/material";
import { APP_CORNER_RADIUS, FLOATING_EDGE_GAP } from "@/style/appShape";
import { FLOATING_CORNER_VARIABLE } from "./floatingCorner";
import { floatingFloorCss } from "./floatingFloor";

/**
 * Posició de qualsevol `Snackbar` de l'app.
 *
 * Per sota de `sm` el `Snackbar` de MUI s'estén de banda a banda —hi força
 * `left: 8, right: 8` sigui quin sigui l'`anchorOrigin`— i taparia el control
 * que hi hagi al racó, justament quan l'usuari acaba de desar i pot voler mirar
 * on ha anat a parar la feina (troballa C7). Es mou l'avís i no el control
 * perquè el control és permanent i l'avís és de pas.
 *
 * **Només s'aparta si hi ha alguna cosa de què apartar-se**: la reserva surt de
 * la variable que declara qui ocupa el racó (`useFloatingCorner`), i on no hi ha
 * cap control flotant —inici, registre, panell d'administració— l'avís es queda
 * enganxat als dos cantons. Amb el desplaçament escrit a l'sx, aquelles pàgines
 * ensenyaven un avís descentrat sense res que ho justifiqués.
 *
 * I s'ancora **on s'ancora tota la resta**: `FLOATING_EDGE_GAP`, no els 8 px que
 * MUI posa per sota de `sm`. L'avís i el botó d'estat comparteixen la franja de
 * baix, i amb dues bases separades per 8 px es veien desalineats —l'avís queia
 * més avall i més a prop del cantó esquerre que el botó del dret— sense que la
 * diferència volgués dir res.
 *
 * Amb un panell de baix obert (`AppBottomSheet`), l'avís puja damunt del panell:
 * el marge surt del terra que el panell declara (`floatingFloor`), i sense
 * panell val zero. Un marge i no el `bottom`, perquè per damunt de `sm` el
 * `bottom` el posa MUI i així no s'ha de copiar.
 */
export const floatingSnackbarSx: SxProps<Theme> = (theme) => ({
  marginBottom: floatingFloorCss,
  [theme.breakpoints.down("sm")]: {
    bottom: FLOATING_EDGE_GAP,
    left: FLOATING_EDGE_GAP,
    right: `var(${FLOATING_CORNER_VARIABLE}, ${FLOATING_EDGE_GAP}px)`,
  },
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
