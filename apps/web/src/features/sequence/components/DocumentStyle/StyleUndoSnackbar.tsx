// Confirmació d'haver aplicat un estil al document, amb «Desfés».
//
// És la confirmació d'una acció que l'usuari acaba de fer, i per això és un
// snackbar i no un bàner (`docs/estandards/feedback-i-accions.md`). Com que porta
// una acció, dura més que les confirmacions soles (10 s) i el temps s'atura
// mentre el ratolí o el focus hi són (comportament de `Snackbar` de MUI).
//
// N'hi ha dues instàncies i només se'n pinta una: la del layout i la del panell
// «Estil del document». Amb el diàleg de configuració obert, el focus hi queda
// atrapat i el snackbar del layout no s'hi podria fer servir amb el teclat; el
// del panell va al DOM just després de les accions d'estil, i el tabulador hi
// arriba tot seguit, encara que es pinti a baix.
import React, { RefObject, SyntheticEvent } from "react";
import { Theme } from "@mui/material/styles";
import { Alert, Snackbar } from "@mui/material";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN, FLOATING_EDGE_GAP } from "@/style/appShape";
import {
  floatingNoticeSx,
  floatingSnackbarSx,
} from "@components/FloatingLayer";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import {
  selectCanUndoStyle,
  styleUndoSnackbarClosedActionCreator,
  undoStyleChangeThunk,
} from "@features/sequence/store/styleSlice";
import messages from "./DocumentStyle.lang";

/** Prou temps per llegir-lo i arribar a «Desfés» amb el teclat */
const UNDO_SNACKBAR_DURATION_MS = 10000;

/**
 * Alçada a què es posa quan n'hi ha un altre de sota: la de la confirmació
 * d'una línia més l'aire entre tots dos. En mòbil la confirmació pot fer dues
 * línies. Parteix de l'àncora de cada mida (`floatingSnackbarSx` per sota de
 * `sm`, els 24 px de MUI per sobre).
 */
const STACKED_BOTTOM = {
  xs: FLOATING_EDGE_GAP + 88,
  sm: 24 + 72,
};

/** La posició de sempre (`floatingSnackbarSx`), una mica més amunt si s'apila. */
const stackedSnackbarSx = (theme: Theme, stacked: boolean) => {
  const mobile = theme.breakpoints.down("sm");
  const base =
    typeof floatingSnackbarSx === "function" ? floatingSnackbarSx(theme) : {};
  if (!stacked) return base;
  const baseMobile = (base as Record<string, object>)[mobile] ?? {};
  return {
    ...base,
    bottom: STACKED_BOTTOM.sm,
    [mobile]: { ...baseMobile, bottom: STACKED_BOTTOM.xs },
  };
};

interface StyleUndoSnackbarProps {
  /** On es pinta: al layout, o dins del panell amb el diàleg obert */
  placement: "layout" | "panel";
  /** On torna el focus en desfer, perquè no caigui al buit */
  returnFocusRef?: RefObject<HTMLElement>;
}

/** Què s'ha fet, segons d'on ve el canvi. */
const CHANGED_MESSAGE = {
  file: messages.changedFile,
  userDefault: messages.changedUserDefault,
  applyAll: messages.changedApplyAll,
  reset: messages.changedReset,
  fitTextPictogram: messages.changedFitTextPictogram,
  fitTextDocument: messages.changedFitTextDocument,
} as const;

const StyleUndoSnackbar = ({
  placement,
  returnFocusRef,
}: StyleUndoSnackbarProps): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar, state: feedback } = useFeedback();
  const snackbar = useAppSelector((state) => state.style.undoSnackbar);
  const settingsDialogOpen = useAppSelector(
    (state) => state.style.settingsDialogOpen,
  );
  const canUndo = useAppSelector(selectCanUndoStyle);

  // Si hi ha un altre snackbar obert (el de «Fitxer carregat», o el de la
  // configuració desada en tancar el panell), aquest s'hi posa a sobre en
  // comptes de tapar-lo o de tancar-se: el «Desfés» no pot desaparecer només
  // perquè ha arribat una confirmació d'una altra cosa
  const stacked = feedback.snackbar.open;

  const mine = (placement === "panel") === settingsDialogOpen;
  if (!mine || snackbar === null) return null;

  const close = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    dispatch(styleUndoSnackbarClosedActionCreator());
  };

  const handleUndo = () => {
    dispatch(undoStyleChangeThunk());
    returnFocusRef?.current?.focus();
    showSnackbar({
      message: intl.formatMessage(messages.undone),
      severity: "success",
    });
  };

  return (
    <Snackbar
      // Un canvi nou reinicia el temps encara que el text sigui el mateix
      key={snackbar.id}
      // Si el document s'ha tocat després, desfer ja no toca: no s'ofereix
      open={canUndo}
      autoHideDuration={UNDO_SNACKBAR_DURATION_MS}
      onClose={close}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={(theme: Theme) => stackedSnackbarSx(theme, stacked)}
    >
      <Alert
        severity="success"
        variant="outlined"
        sx={floatingNoticeSx}
        onClose={close}
        closeText={intl.formatMessage(messages.closeNotice)}
        slotProps={{
          closeButton: {
            sx: {
              minWidth: APP_TOUCH_TARGET_MIN,
              minHeight: APP_TOUCH_TARGET_MIN,
            },
          },
        }}
        action={
          <StyledButton
            color="inherit"
            onClick={handleUndo}
            sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          >
            {intl.formatMessage(messages.undo)}
          </StyledButton>
        }
      >
        {intl.formatMessage(CHANGED_MESSAGE[snackbar.source])}
      </Alert>
    </Snackbar>
  );
};

export default StyleUndoSnackbar;
