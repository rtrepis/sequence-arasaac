import React, {
  ReactElement,
  ReactNode,
  UIEvent,
  useEffect,
  useState,
} from "react";
import {
  Box,
  Collapse,
  Dialog,
  DialogContent,
  DialogProps,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  APP_DIALOG_HEADER_HIDE_AT,
  APP_DIALOG_HEADER_SHOW_AT,
  appDialogBadge,
  appDialogBadgeCompact,
  appDialogHeader,
  appDialogHeaderCompact,
  appDialogHeaderSlot,
  appDialogTitle,
  appDialogTitleGroup,
} from "./appDialog.styled";

interface AppDialogProps {
  open: boolean;
  /** Tancar sense fer res: la creu de la finestra, l'ESC i el clic a fora. */
  onClose: () => void;
  /** Diu on ets i què hi fas. Va centrat i és el nom accessible del diàleg. */
  title: string;
  /** Identificador del títol; el diàleg s'hi lliga amb `aria-labelledby`. */
  titleId: string;
  /**
   * Contingut del distintiu que contextualitza el títol —el número del
   * pictograma que s'edita—, que es pinta a la rodona verda de l'estàndard.
   * S'anuncia com a part del nom del diàleg: «Editar Pictograma 4».
   */
  badge?: ReactNode;
  /**
   * Acció d'icona de la capçalera. **Només** un menú de més accions: tancar viu
   * al peu, en un sol lloc de tota l'app. Amb una creu aquí, el mateix racó
   * voldria dir dues coses segons el diàleg.
   */
  headerAction?: ReactNode;
  /** Sempre un `<AppDialogActions>`. */
  actions?: ReactNode;
  /**
   * Estat de l'operació en curs —una barra de progrés, l'error de l'últim
   * intent— entre el contingut i el peu. Hi va i no dins del contingut perquè
   * ha de quedar visible sempre: amb una llista llarga, a dins quedaria fora
   * de pantalla justament mentre s'espera.
   */
  statusSlot?: ReactNode;
  children: ReactNode;
  /** `xs` per a una pregunta o un missatge; `sm` per a un formulari o una llista. */
  maxWidth?: DialogProps["maxWidth"];
  /** Línies que separen el contingut de la capçalera i del peu. */
  dividers?: boolean;
  /** Identificador del text que descriu el diàleg (`aria-describedby`). */
  describedById?: string;
  contentSx?: SxProps<Theme>;
  transitionProps?: DialogProps["TransitionProps"];
  /**
   * Ocupa tota la pantalla al mòbil (per sota de `sm`). Per a un formulari
   * llarg que s'hi fa servir sovint, com l'edició d'un pictograma: la forma no
   * canvia (capçalera, contingut i peu), només deixa de surar. La capçalera
   * hi és més baixa i, en fer baixar el contingut, s'amaga per deixar-li lloc;
   * torna en tornar a dalt de tot
   */
  fullScreenOnMobile?: boolean;
}

/**
 * Diàleg canònic de l'app: capçalera amb el títol centrat, contingut i peu.
 *
 * La capçalera té tres franges —una de buida, el títol amb el seu distintiu, i
 * l'acció d'icona— perquè el títol quedi centrat tant si hi ha acció com si no.
 * El radi el posa el tema (`MuiDialog`), no aquest component.
 *
 * Vegeu `docs/ESTANDARD-capes-flotants.md`.
 */
const AppDialog = ({
  open,
  onClose,
  title,
  titleId,
  badge,
  headerAction,
  actions,
  statusSlot,
  children,
  maxWidth = "sm",
  dividers = true,
  describedById,
  contentSx,
  transitionProps,
  fullScreenOnMobile = false,
}: AppDialogProps): ReactElement => {
  const badgeId = `${titleId}-badge`;
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm"),
  );
  const fullScreen = fullScreenOnMobile && isMobile;
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Capçalera amagada perquè el contingut ha baixat. Dos llindars diferents
  // perquè, en plegar-se, la capçalera no faci saltar el desplaçament i
  // s'obri i es tanqui sola
  const [headerAway, setHeaderAway] = useState(false);
  // Cada obertura comença amb el contingut a dalt: la capçalera hi torna
  useEffect(() => {
    if (open) setHeaderAway(false);
  }, [open]);
  const handleContentScroll = (event: UIEvent<HTMLDivElement>): void => {
    const { scrollTop } = event.currentTarget;
    if (scrollTop > APP_DIALOG_HEADER_HIDE_AT) setHeaderAway(true);
    else if (scrollTop < APP_DIALOG_HEADER_SHOW_AT) setHeaderAway(false);
  };

  const header = (
    <Box sx={fullScreen ? appDialogHeaderCompact : appDialogHeader}>
      {/* Franja buida que compensa la de l'acció */}
      <Box sx={appDialogHeaderSlot} aria-hidden />

      <Box sx={appDialogTitleGroup}>
        <Typography
          id={titleId}
          variant={fullScreen ? "h6" : "h5"}
          component="h2"
          sx={appDialogTitle}
        >
          {title}
        </Typography>

        {badge !== undefined && (
          <Typography
            id={badgeId}
            variant={fullScreen ? "h6" : "h4"}
            component="span"
            sx={fullScreen ? appDialogBadgeCompact : appDialogBadge}
          >
            {badge}
          </Typography>
        )}
      </Box>

      <Box sx={appDialogHeaderSlot}>{headerAction}</Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      // El distintiu forma part del nom: sense ell, el lector de pantalla diu
      // «Editar Pictograma» i qui l'escolta no sap quin dels vuit està editant
      aria-labelledby={badge === undefined ? titleId : `${titleId} ${badgeId}`}
      aria-describedby={describedById}
      TransitionProps={transitionProps}
    >
      {fullScreen ? (
        // `Collapse` deixa la capçalera amb `visibility: hidden` quan s'ha
        // plegat: el teclat no hi entra, però el títol continua sent el nom
        // del diàleg. Sense encongir-se: el contingut és qui cedeix l'alçada
        <Collapse
          in={!headerAway}
          timeout={reducedMotion ? 0 : "auto"}
          sx={{ flexShrink: 0 }}
        >
          {header}
        </Collapse>
      ) : (
        header
      )}

      <DialogContent
        dividers={dividers}
        sx={contentSx}
        onScroll={fullScreen ? handleContentScroll : undefined}
      >
        {children}
      </DialogContent>

      {statusSlot}

      {actions}
    </Dialog>
  );
};

export default AppDialog;
