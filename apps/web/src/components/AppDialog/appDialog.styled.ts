import { SxProps, Theme } from "@mui/material";

/**
 * Amplada de les dues franges laterals de la capçalera. És l'amplada d'un
 * `IconButton` mitjà de MUI: amb les dues iguals, el títol queda centrat de
 * debò tant si hi ha acció d'icona com si no, sense que la seva presència el
 * desplaci mig botó cap a l'esquerra.
 */
export const APP_DIALOG_HEADER_SLOT = 40;

export const appDialogHeader: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  padding: 1.5,
};

export const appDialogHeaderSlot: SxProps<Theme> = {
  width: APP_DIALOG_HEADER_SLOT,
  flex: `0 0 ${APP_DIALOG_HEADER_SLOT}px`,
  display: "flex",
  justifyContent: "flex-end",
};

export const appDialogTitleGroup: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1.5,
};

export const appDialogTitle: SxProps<Theme> = {
  textAlign: "center",
};

/**
 * Distintiu que contextualitza el títol: diu **sobre què** actua el diàleg
 * (avui, el número del pictograma que s'està editant). Ve de
 * `circlePictogramNumber`, que vivia al modal d'edició.
 */
export const appDialogBadge: SxProps<Theme> = {
  backgroundColor: "primary.main",
  borderRadius: "50%",
  color: "primary.contrastText",
  minWidth: "2.75rem",
  textAlign: "center",
  flexShrink: 0,
};

/**
 * Peu: l'acció destructiva secundària queda sola a l'esquerra i la resta a la
 * dreta. Amb `flexWrap`, en un diàleg estret els botons baixen de línia en
 * comptes de comprimir-se.
 */
export const appDialogActions = (hasStartAction: boolean): SxProps<Theme> => ({
  justifyContent: hasStartAction ? "space-between" : "flex-end",
  flexWrap: "wrap",
  gap: 1,
  paddingInline: 3,
  paddingBottom: 2,
});
