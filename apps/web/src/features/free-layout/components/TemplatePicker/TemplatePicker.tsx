import React, { useEffect, useRef } from "react";
import { Box, ButtonBase, Tooltip, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import type { PagePlacement } from "@/types/document";
import {
  LayoutTemplate,
  slotKind,
  templateFits,
} from "@features/free-layout/model/templates";
import { isBoxed } from "@features/free-layout/model/placement";
import { TEMPLATE_NAMES } from "@features/free-layout/components/FreeLayoutPages/templateNames";
import levelMessages from "@features/free-layout/components/ViewLevels/ViewLevels.lang";
import TemplateThumbnail from "./TemplateThumbnail";

/** Quant s'ha de mantenir premuda una opció perquè la pàgina l'ensenyi. */
export const LONG_PRESS_MS = 450;

interface TemplatePickerProps {
  templates: readonly LayoutTemplate[];
  /** La plantilla que té la pàgina, si és una d'aquestes */
  value: string | undefined;
  /** Els blocs de la pàgina: decideixen quines plantilles hi caben */
  placements: readonly PagePlacement[];
  /** L'orientació del paper: les miniatures la segueixen */
  landscape: boolean;
  /** El títol de la fila, per al nom del grup */
  labelId: string;
  helperId?: string;
  onApply: (template: LayoutTemplate) => void;
  /** La plantilla que la pàgina ha d'ensenyar com a guies, o cap */
  onPreview: (template: LayoutTemplate | null) => void;
}

/**
 * El selector de plantilles del nivell «Pàgina» (R4): una graella de botons,
 * cadascun amb la miniatura de la plantilla i el nom. Passar per damunt d'un
 * botó, anar-hi amb el teclat o, en una pantalla tàctil, mantenir-lo premut
 * fa que la pàgina n'ensenyi els espais, sense moure res; el clic l'aplica
 * (amb «Desfés»). Les plantilles on no caben les seqüències de la pàgina hi
 * són, però no es poden triar, i diuen per què.
 */
const TemplatePicker = ({
  templates,
  value,
  placements,
  landscape,
  labelId,
  helperId,
  onApply,
  onPreview,
}: TemplatePickerProps): React.ReactElement => {
  const intl = useIntl();
  const pressTimer = useRef<number | undefined>(undefined);
  // Després d'un toc llarg, el clic que el segueix no aplica la plantilla
  const longPressed = useRef(false);
  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;

  // En desmuntar-se (es canvia de pàgina, de repartiment…), les guies se'n van
  useEffect(
    () => () => {
      window.clearTimeout(pressTimer.current);
      onPreviewRef.current(null);
    },
    [],
  );

  const sequences = placements.filter(
    (placement) => isBoxed(placement) && placement.kind === "sequence",
  ).length;

  const cancelPress = () => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = undefined;
  };

  return (
    <Box
      role="group"
      aria-labelledby={labelId}
      aria-describedby={helperId}
      onMouseLeave={() => onPreview(null)}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
        gap: 1,
      }}
    >
      {templates.map((template) => {
        const name = intl.formatMessage(TEMPLATE_NAMES[template.id]);
        const fits = templateFits(template, placements);
        const selected = template.id === value;
        const landscapeHint = template.landscape
          ? intl.formatMessage(levelMessages.templateLandscape)
          : undefined;
        const reason = fits
          ? landscapeHint
          : intl.formatMessage(levelMessages.templateTooSmall, {
              name,
              slots: template.slots.filter(
                (slot) => slotKind(slot) === "sequence",
              ).length,
              count: sequences,
            });
        const show = () => fits && onPreview(template);
        const hide = () => onPreview(null);
        return (
          <Tooltip key={template.id} title={reason ?? ""} describeChild>
            <ButtonBase
              aria-pressed={selected}
              aria-disabled={!fits || undefined}
              aria-label={name}
              data-template={template.id}
              onMouseEnter={show}
              onFocus={show}
              onBlur={hide}
              onPointerDown={(event) => {
                // Amb el ratolí ja hi ha el «passar per damunt»
                if (event.pointerType === "mouse" || !fits) return;
                longPressed.current = false;
                cancelPress();
                pressTimer.current = window.setTimeout(() => {
                  longPressed.current = true;
                  onPreview(template);
                }, LONG_PRESS_MS);
              }}
              onPointerUp={(event) => {
                if (event.pointerType === "mouse") return;
                cancelPress();
                if (longPressed.current) hide();
              }}
              onPointerCancel={() => {
                cancelPress();
                if (longPressed.current) hide();
              }}
              // El toc llarg no ha d'obrir el menú del navegador
              onContextMenu={(event) => event.preventDefault()}
              onClick={() => {
                if (longPressed.current) {
                  longPressed.current = false;
                  return;
                }
                if (fits && !selected) onApply(template);
              }}
              sx={{
                flexDirection: "column",
                gap: 0.5,
                padding: 1,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                textAlign: "center",
                touchAction: "manipulation",
                userSelect: "none",
                WebkitTouchCallout: "none",
                ...(selected && {
                  borderWidth: 2,
                  borderColor: "primary.main",
                  padding: "7px",
                }),
                ...(!fits && { opacity: 0.45, cursor: "not-allowed" }),
                "&:hover, &.Mui-focusVisible": fits
                  ? { backgroundColor: "action.hover" }
                  : {},
                "&.Mui-focusVisible": {
                  outline: 2,
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
            >
              <TemplateThumbnail template={template} landscape={landscape} />
              <Typography
                component="span"
                variant="caption"
                sx={{
                  lineHeight: 1.2,
                  fontWeight: selected ? "bold" : undefined,
                }}
              >
                {name}
              </Typography>
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default TemplatePicker;
