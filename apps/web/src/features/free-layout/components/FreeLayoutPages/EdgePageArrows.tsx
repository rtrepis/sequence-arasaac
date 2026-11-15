import React from "react";
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

interface EdgePageArrowsProps {
  /** Si hi ha pàgina a cada costat: sense, aquella fletxa no hi és */
  hasPrevious: boolean;
  hasNext: boolean;
  shown: EdgeArrowsShown;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Les fletxes de la vora (N4 de `docs/PLA-vista-mobil.md`): l'alternativa d'un
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

  const arrow = (
    side: "previous" | "next",
    label: string,
    onClick: () => void,
    icon: React.ReactNode,
  ) => (
    <ButtonBase
      key={side}
      aria-label={label}
      data-edge-arrow={side}
      data-shown={shown[side]}
      onClick={(event) => {
        // El toc no ha d'arribar a la vora, que el prendria per un toc al full
        event.stopPropagation();
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
