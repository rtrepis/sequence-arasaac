import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { useIntl } from "react-intl";
import { sheetGuide } from "@/style/palette";
import {
  sameSelection,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import { useSequenceName } from "@features/free-layout/components/FreeLayoutPages/useSequenceName";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";

interface SelectableSequenceProps {
  sequenceKey: number;
  pictogramCount: number;
  /** A la pantalla completa no es selecciona res: és per mirar */
  selectable: boolean;
  /** La disposició de la seqüència al flux (direcció, alineació, espai) */
  sx: SxProps<Theme>;
  children: React.ReactNode;
}

/**
 * Una seqüència a la disposició automàtica, que és el seu únic bloc (R5).
 * Clicar-la (o Enter i Espai) la selecciona i la columna n'ensenya els
 * ajustos. La marca és de l'edició: no surt mai al paper ni al PDF.
 */
const SelectableSequence = ({
  sequenceKey,
  pictogramCount,
  selectable,
  sx,
  children,
}: SelectableSequenceProps): React.ReactElement => {
  const intl = useIntl();
  const sequenceName = useSequenceName();
  const { selection, select } = useViewSelection();
  if (!selectable) return <Box sx={sx}>{children}</Box>;

  const target = { kind: "sequence" as const, sequenceKey };
  const selected = sameSelection(selection, target);

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={intl.formatMessage(pageMessages.placementLabel, {
        name: sequenceName(sequenceKey),
        count: pictogramCount,
        common: "false",
      })}
      onClick={(event) => {
        // El clic fora de cap seqüència treu la selecció: aquest no hi ha d'arribar
        event.stopPropagation();
        select(target);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select(target);
        }
      }}
      sx={[
        {
          position: "relative",
          cursor: "pointer",
          outline: "none",
          "&:hover .sequence-guide, &:focus-visible .sequence-guide": {
            display: "block",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      {/* La marca, per damunt de les targetes: mai al paper ni al PDF */}
      <Box
        className="sequence-guide"
        aria-hidden
        data-html2canvas-ignore
        sx={{
          display: selected ? "block" : "none",
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          border: `${selected ? 4 : 2}px solid ${sheetGuide}`,
          "@media print": { display: "none !important" },
        }}
      />
    </Box>
  );
};

export default SelectableSequence;
