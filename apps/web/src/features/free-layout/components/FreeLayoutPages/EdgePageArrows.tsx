import React, { useLayoutEffect, useRef } from "react";
import { Box, ButtonBase } from "@mui/material";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useIntl } from "react-intl";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { edgeArrow } from "@/style/palette";
import messages from "./FreeLayoutPages.lang";

/** Quina fletxa es veu ara. */
export interface EdgeArrowsShown {
  previous: boolean;
  next: boolean;
}

type Side = keyof EdgeArrowsShown;

interface EdgePageArrowsProps {
  /** Si hi ha pàgina a cada costat: sense, aquella fletxa no hi és */
  hasPrevious: boolean;
  hasNext: boolean;
  shown: EdgeArrowsShown;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Les fletxes de la vora (N4 de `docs/plans/fets/PLA-vista-mobil.md`): l'alternativa d'un
 * toc a lliscar per passar de pàgina. Tocar la vora del full en fa sortir una,
 * semitransparent, uns segons. **Amagades només a la vista**: són sempre a
 * l'arbre d'accessibilitat i a l'ordre de tabulació, i es veuen quan reben el
 * focus. Amagades, no reben el dit: el toc arriba a la vora, que les fa sortir.
 */
const EdgePageArrows = ({
  hasPrevious,
  hasNext,
  shown,
  onPrevious,
  onNext,
}: EdgePageArrowsProps): React.ReactElement => {
  const intl = useIntl();
  const refs = useRef<Record<Side, HTMLButtonElement | null>>({
    previous: null,
    next: null,
  });
  // La fletxa que s'acaba de prémer amb el focus a sobre (teclat o lector de
  // pantalla). Si en arribar a la primera o l'última pàgina desapareix, el
  // focus aniria a parar al `body` i caldria tornar a començar a tabular.
  // Es mira a cada pintada, i es buida, perquè no quedi pendent d'un altre toc
  const pressedWithFocus = useRef<Side | null>(null);

  useLayoutEffect(() => {
    const pressed = pressedWithFocus.current;
    pressedWithFocus.current = null;
    if (!pressed) return;
    const stillThere = pressed === "previous" ? hasPrevious : hasNext;
    if (stillThere) return;
    // Passa a l'altra fletxa, que és la que ara té pàgina
    refs.current[pressed === "previous" ? "next" : "previous"]?.focus();
  });

  const arrow = (
    side: Side,
    label: string,
    onClick: () => void,
    icon: React.ReactNode,
  ) => (
    <ButtonBase
      key={side}
      ref={(element: HTMLButtonElement | null) => {
        refs.current[side] = element;
      }}
      aria-label={label}
      data-edge-arrow={side}
      data-shown={shown[side]}
      onClick={(event) => {
        // El toc no ha d'arribar a la vora, que el prendria per un toc al full
        event.stopPropagation();
        if (event.currentTarget === document.activeElement)
          pressedWithFocus.current = side;
        onClick();
      }}
      sx={{
        position: "absolute",
        top: "50%",
        [side === "previous" ? "left" : "right"]: 6,
        width: APP_TOUCH_TARGET_MIN,
        height: APP_TOUCH_TARGET_MIN,
        marginTop: `-${APP_TOUCH_TARGET_MIN / 2}px`,
        borderRadius: "50%",
        zIndex: 2,
        fontSize: 30,
        color: edgeArrow.icon,
        backgroundColor: edgeArrow.background,
        opacity: shown[side] ? 1 : 0,
        pointerEvents: shown[side] ? "auto" : "none",
        transition: "opacity 150ms",
        "&:focus-visible": {
          opacity: 1,
          pointerEvents: "auto",
          outline: 3,
          outlineStyle: "solid",
          outlineColor: "primary.main",
        },
        "@media print": { display: "none" },
      }}
    >
      {icon}
    </ButtonBase>
  );

  return (
    <Box sx={{ display: "contents" }}>
      {hasPrevious &&
        arrow(
          "previous",
          intl.formatMessage(messages.previousPage),
          onPrevious,
          <MdChevronLeft aria-hidden />,
        )}
      {hasNext &&
        arrow(
          "next",
          intl.formatMessage(messages.nextPage),
          onNext,
          <MdChevronRight aria-hidden />,
        )}
    </Box>
  );
};

export default EdgePageArrows;
