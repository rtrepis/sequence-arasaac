import { SxProps, Theme } from "@mui/material";
import { APP_CORNER_RADIUS, APP_TOUCH_TARGET_MIN } from "@/style/appShape";

export const settingsList: SxProps = { marginBlock: 2 };

/**
 * Fila de la capçalera: a l'esquerra el botó que desplega (la fletxa, la icona
 * i el títol) i a la dreta la ranura de l'acció. Són **germans**, mai un botó
 * dins de l'altre.
 *
 * La ranura es reserva sempre, encara que no hi hagi acció, i la fila té una
 * alçada mínima que ja encabeix un botó: així el títol disposa sempre de la
 * mateixa amplada i el que s'està editant a sota no es mou quan l'acció
 * apareix o desapareix.
 */
export const settingsHeaderRow: SxProps = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  paddingInlineEnd: 1,
  minHeight: APP_TOUCH_TARGET_MIN + 12,
};

/**
 * El botó que desplega. El fons de passar-hi per sobre i el del focus són els
 * de l'`AccordionSummary` de MUI, que és el que hi havia abans: un `ButtonBase`
 * pelat no en porta cap, i amb el teclat no se sabria on s'és.
 */
export const settingsHeaderButton: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 1,
  textAlign: "start",
  paddingBlock: 1,
  paddingInline: 1.5,
  borderRadius: `${APP_CORNER_RADIUS}px`,
  "&:hover": { backgroundColor: "action.hover" },
  "&.Mui-focusVisible": { backgroundColor: "action.focus" },
};

/** La fletxa de sempre, que gira en desplegar: és l'únic que diu que s'obre */
export const settingsHeaderChevron = (expanded: boolean): SxProps<Theme> => ({
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "1.5rem",
  color: "action.active",
  transform: expanded ? "rotate(180deg)" : "none",
  transition: (theme: Theme) =>
    theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
});

/** La icona del títol, a la dreta de la fletxa */
export const settingsHeaderIcon: SxProps<Theme> = {
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "1.5rem",
  color: "action.active",
};

/** La ranura de l'acció, sempre reservada (vegeu `settingsHeaderRow`) */
export const settingsHeaderAction: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexShrink: 0,
  minWidth: APP_TOUCH_TARGET_MIN,
};

export const settingsContent: SxProps = { display: "block", padding: 1 };
