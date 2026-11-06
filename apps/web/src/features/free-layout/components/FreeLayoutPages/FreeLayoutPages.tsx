import React, { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { MdAdd, MdOutlineLibraryAdd } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledButton from "@/style/StyledButton";
import { sheetSurface } from "@/style/palette";
import CopyRight from "@components/CopyRight/CopyRight";
import type { PageDimensions } from "@features/print/utils/pageFormat";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import { mmToPixelsExact } from "@features/print/utils/pageUnits";
import {
  selectDocumentCardDefaults,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import {
  addSheetThunk,
  ensureFreeLayoutThunk,
  selectDocumentContent,
  selectFreeLayout,
  selectSequenceKeys,
  selectSheetArea,
} from "@features/free-layout/store/freeLayoutThunks";
import AddSequenceDialog from "@features/free-layout/components/AddSequenceDialog";
import CardBaseMeasurer, { CardBaseSize } from "./CardBaseMeasurer";
import PageHeader from "./PageHeader";
import PlacementBox from "./PlacementBox";
import { useSequenceName } from "./useSequenceName";
import messages from "./FreeLayoutPages.lang";

/** Aire entre una pàgina i la capçalera de la següent, a la pantalla. */
const PAGE_GAP = 3;

interface FreeLayoutPagesProps {
  /** El full a mida real, en px d'impressió */
  pageDimensions: PageDimensions;
  /** El full encabit a la pantalla */
  displayWidth: number;
  displayHeight: number;
  scale: number;
  author: string;
  licence?: boolean;
}

/**
 * Les pàgines del document en mode lliure (ADR-005), una sota l'altra i totes a
 * la mateixa mida: la que deixa el càlcul d'escala de la vista.
 *
 * Cada pàgina és un `.preview-content`, com el full del flux: és el que
 * imprimeix `usePrintSheet` i el que captura el PDF, un per pàgina. A sobre de
 * cada full hi ha la seva capçalera (que no s'imprimeix), i a sota de totes,
 * «Afegeix una pàgina».
 */
const FreeLayoutPages = ({
  pageDimensions,
  displayWidth,
  displayHeight,
  scale,
  author,
  licence,
}: FreeLayoutPagesProps): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const freeLayout = useAppSelector(selectFreeLayout);
  const content = useAppSelector(selectDocumentContent);
  const area = useAppSelector(selectSheetArea);
  const keys = useAppSelector(selectSequenceKeys);
  const views = useAppSelector(selectResolvedSequenceViews);
  const defaults = useAppSelector(selectDocumentCardDefaults);
  const sequenceName = useSequenceName();
  const [cardSizes, setCardSizes] = useState<Record<number, CardBaseSize>>({});
  const [addingTo, setAddingTo] = useState<number | null>(null);

  // Un fitxer que diu «lliure» però no porta cap pàgina: es construeix aquí
  useEffect(() => {
    if (!freeLayout) dispatch(ensureFreeLayoutThunk());
  }, [dispatch, freeLayout]);

  const measured = useMemo(
    () => keys.map((key) => ({ key, pictograms: content[key] ?? [] })),
    [keys, content],
  );

  if (!freeLayout || !area) return null;
  const sheetCount = freeLayout.sheets.length;
  const areaHeightPx = mmToPixelsExact(area.h, CSS_PRINT_DPI);

  const renderPlacement = (
    placement: (typeof freeLayout.common)[number],
    sheetIndex: number,
    common: boolean,
  ) => {
    const pictograms = content[placement.sequenceKey];
    const view = views[placement.sequenceKey];
    if (!pictograms || !view) return null;
    return (
      <PlacementBox
        key={placement.id}
        placement={placement}
        sheetIndex={sheetIndex}
        sheetCount={sheetCount}
        common={common}
        name={sequenceName(placement.sequenceKey)}
        pictograms={pictograms}
        view={view}
        cardBase={cardSizes[placement.sequenceKey]}
        defaults={defaults}
      />
    );
  };

  const handleAddPage = () => {
    dispatch(addSheetThunk(sheetCount - 1));
    showSnackbar({
      message: intl.formatMessage(messages.pageAdded, {
        number: sheetCount + 1,
      }),
      severity: "success",
    });
  };

  return (
    <Stack gap={PAGE_GAP} sx={{ minWidth: 0 }}>
      <CardBaseMeasurer
        sequences={measured}
        defaults={defaults}
        onMeasure={setCardSizes}
      />

      {freeLayout.sheets.map((sheet, sheetIndex) => {
        const empty =
          sheet.placements.length === 0 && freeLayout.common.length === 0;
        return (
          <Stack
            key={sheet.id}
            component="section"
            gap={1}
            aria-label={intl.formatMessage(messages.pageLabel, {
              number: sheetIndex + 1,
              total: sheetCount,
            })}
          >
            <PageHeader
              sheetIndex={sheetIndex}
              sheetCount={sheetCount}
              placementCount={sheet.placements.length}
              onAddSequence={() => setAddingTo(sheetIndex)}
            />

            {/* El full encabit a la pantalla; a dins, a mida real i escalat */}
            <Box
              sx={{
                width: displayWidth,
                height: displayHeight,
                overflow: "hidden",
                outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                backgroundColor: sheetSurface,
              }}
            >
              <Box
                className="preview-content"
                sx={{
                  width: pageDimensions.width,
                  height: pageDimensions.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* L'àrea útil: les caixes hi van en mm des del cantó de dalt */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: areaHeightPx,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {/* Les comunes, per sota de les de la pàgina */}
                  {freeLayout.common.map((placement) =>
                    renderPlacement(placement, sheetIndex, true),
                  )}
                  {sheet.placements.map((placement) =>
                    renderPlacement(placement, sheetIndex, false),
                  )}

                  {empty && (
                    <Stack
                      data-html2canvas-ignore
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        "@media print": { display: "none" },
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="p"
                        sx={{ color: "text.secondary" }}
                      >
                        {intl.formatMessage(messages.emptyPage)}
                      </Typography>
                      <StyledButton
                        variant="contained"
                        size="large"
                        startIcon={<MdOutlineLibraryAdd />}
                        onClick={() => setAddingTo(sheetIndex)}
                      >
                        {intl.formatMessage(messages.addSequence)}
                      </StyledButton>
                    </Stack>
                  )}
                </Box>

                <Box sx={{ marginTop: "auto" }}>
                  <CopyRight author={author} licence={licence} />
                </Box>
              </Box>
            </Box>
          </Stack>
        );
      })}

      <Box sx={{ "@media print": { display: "none" } }}>
        <StyledButton
          color="inherit"
          startIcon={<MdAdd />}
          onClick={handleAddPage}
        >
          {intl.formatMessage(messages.addPage)}
        </StyledButton>
      </Box>

      <AddSequenceDialog
        sheetIndex={addingTo}
        onClose={() => setAddingTo(null)}
      />
    </Stack>
  );
};

export default FreeLayoutPages;
