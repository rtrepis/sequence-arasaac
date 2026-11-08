import React from "react";
import { sheetGuide, sheetSurface } from "@/style/palette";
import {
  LayoutTemplate,
  slotKind,
} from "@features/free-layout/model/templates";

/** El costat llarg de la miniatura, en unitats del `viewBox`. */
const LONG = 52;
/** El costat curt. */
const SHORT = 40;
/** El marge del full a la miniatura. */
const MARGIN = 3;
/** L'espai entre dos espais de la plantilla. */
const GAP = 1.6;

interface TemplateThumbnailProps {
  template: LayoutTemplate;
  /** L'orientació del paper del document: la miniatura la segueix */
  landscape: boolean;
}

/**
 * La miniatura d'una plantilla (R4): un full petit amb els espais de la
 * plantilla. Els espais de seqüència són plens i els de rètol, una vora
 * discontínua amb una ratlla de text. És damunt del full, i per això porta els
 * colors del full i de les guies, que no canvien amb el tema. És decorativa: el
 * nom el porta el botó.
 */
const TemplateThumbnail = ({
  template,
  landscape,
}: TemplateThumbnailProps): React.ReactElement => {
  const width = landscape ? LONG : SHORT;
  const height = landscape ? SHORT : LONG;
  const innerW = width - 2 * MARGIN;
  const innerH = height - 2 * MARGIN;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      focusable="false"
    >
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        rx={2}
        fill={sheetSurface}
        stroke={sheetGuide}
        strokeWidth={0.6}
      />
      {template.slots.map((slot, index) => {
        const x = MARGIN + slot.x * innerW + GAP / 2;
        const y = MARGIN + slot.y * innerH + GAP / 2;
        const w = Math.max(1, slot.w * innerW - GAP);
        const h = Math.max(1, slot.h * innerH - GAP);
        if (slotKind(slot) === "text")
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={0.8}
                fill="none"
                stroke={sheetGuide}
                strokeWidth={0.6}
                strokeDasharray="1.4 0.9"
              />
              {/* Una ratlla de text, al mig del rètol */}
              <line
                x1={x + w * 0.25}
                x2={x + w * 0.75}
                y1={y + h / 2}
                y2={y + h / 2}
                stroke={sheetGuide}
                strokeWidth={Math.min(1.2, h / 3)}
                strokeLinecap="round"
              />
            </g>
          );
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={0.8}
            fill={sheetGuide}
            fillOpacity={0.3}
            stroke={sheetGuide}
            strokeWidth={0.6}
          />
        );
      })}
    </svg>
  );
};

export default TemplateThumbnail;
