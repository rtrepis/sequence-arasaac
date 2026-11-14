import React from "react";
import { Box } from "@mui/material";
import { useIntl } from "react-intl";
import { sheetGuide } from "@/style/palette";
import type { TextPlacement } from "@/types/document";
import type { ResolvedTextStyle } from "@features/free-layout/model/blockStyle";
import { fontStack } from "@features/sequence/style/styleModel";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import type { SheetArea } from "@features/free-layout/model/placement";
import PlacementBox, { editMarkSx, px } from "./PlacementBox";
import messages from "./FreeLayoutPages.lang";

/** L'interlineat del rètol. */
const LINE_HEIGHT = 1.2;

/** La lletra de mida 1, en px: la mateixa base que el text de les targetes. */
const FONT_BASE_PX = 20;

/** El que ocupen els marges de dins del rètol, en px (de dalt i de baix). */
const PADDING_PX = 8;

/**
 * La mida de la lletra d'un rètol, en px: la triada, com a màxim (Q2). Si les
 * línies no hi caben d'alçada, es fa més petita. L'amplada no es mesura: el
 * text es parteix en línies, com a la targeta.
 */
export const labelFontPx = (
  size: number,
  lines: number,
  heightPx?: number,
): number => {
  const chosen = FONT_BASE_PX * size;
  if (heightPx === undefined) return chosen;
  const fits = (heightPx - PADDING_PX) / (Math.max(1, lines) * LINE_HEIGHT);
  return Math.max(1, Math.min(chosen, fits));
};

interface TextContentProps {
  text: string;
  style: ResolvedTextStyle;
  /** L'alçada de la caixa, en px: la lletra no en passa */
  heightPx?: number;
}

/**
 * El text d'un rètol (R9): text de debò, també al paper i al PDF, amb la
 * lletra de l'estil del document i el retoc del rètol. Un rètol buit no
 * imprimeix res; a la pantalla, ho diu.
 */
export const TextContent = ({
  text,
  style,
  heightPx,
}: TextContentProps): React.ReactElement => {
  const intl = useIntl();
  const lines = text.split("\n").length;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: ALIGN_V[style.alignmentV],
        alignItems: ALIGN_H[style.alignmentH],
        width: "100%",
        height: "100%",
        padding: `${PADDING_PX / 2}px`,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {text.trim() === "" ? (
        <Box component="span" sx={{ ...editMarkSx, color: sheetGuide }}>
          {intl.formatMessage(messages.textBlockEmpty)}
        </Box>
      ) : (
        <Box
          component="p"
          sx={{
            margin: 0,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            textAlign: style.alignmentH,
            lineHeight: LINE_HEIGHT,
            fontFamily: fontStack(style.font.family),
            fontWeight: style.bold ? "bold" : "normal",
            fontSize: labelFontPx(style.font.size, lines, heightPx),
            color: style.font.color,
          }}
        >
          {text}
        </Box>
      )}
    </Box>
  );
};

/** El nom d'un rètol: la primera línia del text, o «Rètol buit». */
export const useTextBlockName = (): ((text: string) => string) => {
  const intl = useIntl();
  return (text: string) =>
    text.split("\n").find((line) => line.trim() !== "") ??
    intl.formatMessage(messages.textBlockEmpty);
};

interface TextBlockProps {
  placement: TextPlacement;
  sheetIndex: number;
  sheetCount: number;
  common: boolean;
  /** L'aspecte del rètol, ja resolt amb la cascada */
  style: ResolvedTextStyle;
  scale: number;
  /** L'àrea útil del full: amb ella, el bloc es pot moure (fase 4) */
  area?: SheetArea;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Un rètol en una pàgina en blocs (R9): un text sol, sense pictograma, a la
 * seva caixa. Es selecciona com un bloc, i el text i l'aspecte es canvien a la
 * columna.
 */
const TextBlock = ({
  placement,
  style,
  common,
  ...box
}: TextBlockProps): React.ReactElement => {
  const intl = useIntl();
  const name = useTextBlockName()(placement.text);
  return (
    <PlacementBox
      {...box}
      placement={placement}
      common={common}
      name={name}
      label={intl.formatMessage(messages.textBlockLabel, {
        text: name,
        common: String(common),
      })}
      actionsLabel={intl.formatMessage(messages.textBlockActions, {
        text: name,
      })}
      contentSx={{ display: "flex" }}
    >
      <TextContent
        text={placement.text}
        style={style}
        heightPx={px(placement.h)}
      />
    </PlacementBox>
  );
};

export default TextBlock;
