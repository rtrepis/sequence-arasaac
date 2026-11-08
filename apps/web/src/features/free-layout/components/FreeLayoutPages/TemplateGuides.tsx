import React from "react";
import { Box } from "@mui/material";
import { useIntl } from "react-intl";
import { sheetGuide, sheetSurface } from "@/style/palette";
import type { Box as MmBox } from "@features/free-layout/model/placement";
import {
  LayoutTemplate,
  slotKind,
  slotToBox,
} from "@features/free-layout/model/templates";
import { editMarkSx, px } from "./PlacementBox";
import messages from "./FreeLayoutPages.lang";

interface TemplateGuidesProps {
  template: LayoutTemplate;
  /** La part del full que deixen lliure els blocs comuns, en mm */
  region: MmBox;
}

/**
 * Els espais d'una plantilla dibuixats damunt de la pàgina, mentre es
 * previsualitza al selector (R4). No mouen res ni es poden clicar: són una
 * guia de l'edició, i no surten mai al paper ni al PDF. Els espais de rètol
 * són discontinus i ho diuen.
 */
const TemplateGuides = ({
  template,
  region,
}: TemplateGuidesProps): React.ReactElement => {
  const intl = useIntl();
  return (
    <Box
      aria-hidden
      data-html2canvas-ignore
      data-testid="template-guides"
      sx={{
        ...editMarkSx,
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {template.slots.map((slot, index) => {
        const box = slotToBox(slot, region);
        const text = slotKind(slot) === "text";
        return (
          <Box
            key={index}
            sx={{
              position: "absolute",
              left: px(box.x),
              top: px(box.y),
              width: px(box.w),
              height: px(box.h),
              boxSizing: "border-box",
              border: `4px ${text ? "dashed" : "solid"} ${sheetGuide}`,
              display: "flex",
              alignItems: "flex-start",
              padding: 0.5,
            }}
          >
            {text && (
              <Box
                component="span"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  paddingInline: 0.75,
                  borderRadius: 1,
                  color: sheetSurface,
                  backgroundColor: sheetGuide,
                }}
              >
                {intl.formatMessage(messages.guideText)}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TemplateGuides;
