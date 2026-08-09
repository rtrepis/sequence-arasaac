import { alpha } from "@mui/material";
import { SxProps, SystemStyleObject, Theme } from "@mui/system";

/**
 * Estils canònics dels tabs de navegació sobre la NavBar verda.
 * Font única de veritat per als tabs d'edició/visualització i per als
 * del modal de configuracions per defecte.
 */

/**
 * Breakpoint a partir del qual el text del tab és visible.
 * Per sota, el tab pot ser només icona: el nom viatja a l'`aria-label` (lectors de
 * pantalla) i, segons el context, al tab seleccionat o a l'encapçalament del panell.
 * És el mateix `sm` de l'estàndard de configuracions, per no multiplicar ruptures.
 */
export const APP_TAB_LABEL_BREAKPOINT = "sm" as const;

// Tabs sobre la NavBar verda: tots els colors deriven de primary.contrastText
export const tabsStyled: SxProps<Theme> = {
  "& .MuiTabs-indicator": {
    bottom: "8px", // Pujar la línia
    height: "4px", // Gruix de la línia
    borderRadius: "2px", // Fer els extrems arrodonits
    backgroundColor: "primary.contrastText",
  },
  "& .MuiTab-root": {
    paddingBottom: "8px", // Ajustar el padding del text dels tabs
    // Tabs no seleccionats: atenuats però llegibles sobre el verd
    color: (theme: Theme) => alpha(theme.palette.primary.contrastText, 0.65),
    textTransform: "none",
    "&.Mui-selected": {
      color: "primary.contrastText",
    },
    "&:hover": {
      color: (theme: Theme) => alpha(theme.palette.primary.contrastText, 0.85),
    },
  },
};

/**
 * Tab individual. Tots els ajustos van dins d'un `breakpoints.down`: per sobre del
 * breakpoint el tab conserva intactes les mides natives de MUI. **No declarar aquí
 * cap valor per a escriptori** — en particular `fontSize: "inherit"`, que faria que
 * el tab heretés l'1.75rem del `Toolbar` de `BarNavigation` i es veiés desmesurat.
 *
 * En mòbil, el tab sense text retalla l'amplada mínima de MUI (90px, pensada per a
 * text) i el marge que separa la icona del text, i amplia la icona — que hereta la
 * mida de lletra del tab — per compensar la pèrdua del text.
 */
export const appTabSx =
  (isSelected: boolean) =>
  (theme: Theme): SystemStyleObject<Theme> => ({
    [theme.breakpoints.down(APP_TAB_LABEL_BREAKPOINT)]: {
      minWidth: isSelected ? "auto" : 48,
      paddingInline: theme.spacing(1.5),
      fontSize: isSelected ? "1rem" : "1.4rem",
      "& .MuiTab-iconWrapper": {
        marginRight: isSelected ? "6px" : 0,
      },
    },
  });

/**
 * Text del tab. S'amaga amb CSS i no amb `useMediaQuery` perquè el canvi d'amplada
 * no depengui d'un render de JavaScript ni faci flash en carregar.
 */
export const appTabLabelSx =
  (isSelected: boolean) =>
  (theme: Theme): SystemStyleObject<Theme> => ({
    display: "flex",
    alignItems: "center",
    fontFamily: "SF.NS",
    fontSize: "inherit",
    whiteSpace: "nowrap",
    [theme.breakpoints.down(APP_TAB_LABEL_BREAKPOINT)]: {
      display: isSelected ? "flex" : "none",
    },
  });
