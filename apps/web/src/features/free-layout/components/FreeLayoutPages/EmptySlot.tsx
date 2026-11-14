import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { MdOutlineLibraryAdd, MdTitle } from "react-icons/md";
import { useIntl } from "react-intl";
import { sheetGuide, sheetSurface } from "@/style/palette";
import type { Box as MmBox } from "@features/free-layout/model/placement";
import { editMarkSx, px } from "./PlacementBox";
import messages from "./FreeLayoutPages.lang";

interface EmptySlotProps {
  /** La caixa de l'espai, en mm */
  box: MmBox;
  /** El número de l'espai, per al nom accessible */
  number: number;
  /** L'escala del full a la pantalla: els botons es pinten a mida de pantalla */
  scale: number;
  onAddText: () => void;
  onAddSequence: () => void;
}

/**
 * Un espai lliure del repartiment d'una pàgina en blocs (R4): un bloc buit,
 * amb els botons per posar-hi un text o una seqüència. És de l'edició: no surt
 * mai al paper ni al PDF.
 */
const EmptySlot = ({
  box,
  number,
  scale,
  onAddText,
  onAddSequence,
}: EmptySlotProps): React.ReactElement => {
  const intl = useIntl();
  // Dins del full escalat: els botons, a mida de pantalla
  const zoom = 1 / Math.max(scale, 0.01);
  const buttonSx = {
    fontSize: 13 * zoom,
    paddingInline: 1 * zoom,
    paddingBlock: 0.25 * zoom,
    minWidth: 0,
    color: sheetGuide,
    backgroundColor: sheetSurface,
    borderColor: sheetGuide,
    "& .MuiButton-startIcon > svg": { fontSize: 18 * zoom },
    "&:hover": { backgroundColor: sheetSurface, borderColor: sheetGuide },
  };
  return (
    <Stack
      role="group"
      aria-label={intl.formatMessage(messages.emptySlotLabel, { number })}
      data-html2canvas-ignore
      alignItems="center"
      justifyContent="center"
      gap={0.5 * zoom}
      onClick={(event) => event.stopPropagation()}
      sx={{
        ...editMarkSx,
        position: "absolute",
        left: px(box.x),
        top: px(box.y),
        width: px(box.w),
        height: px(box.h),
        boxSizing: "border-box",
        border: `${2 * zoom}px dashed ${sheetGuide}`,
        flexWrap: "wrap",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      <Box component="span" sx={{ display: "contents" }}>
        <Button
          variant="outlined"
          startIcon={<MdTitle />}
          onClick={onAddText}
          sx={buttonSx}
        >
          {intl.formatMessage(messages.emptySlotAddText)}
        </Button>
        <Button
          variant="outlined"
          startIcon={<MdOutlineLibraryAdd />}
          onClick={onAddSequence}
          sx={buttonSx}
        >
          {intl.formatMessage(messages.emptySlotAddSequence)}
        </Button>
      </Box>
    </Stack>
  );
};

export default EmptySlot;
