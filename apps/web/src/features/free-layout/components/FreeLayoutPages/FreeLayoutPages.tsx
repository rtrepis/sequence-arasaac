import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MdAdd, MdOutlineLibraryAdd } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledButton from "@/style/StyledButton";
import { sheetGuide, sheetSurface } from "@/style/palette";
import CopyRight from "@components/CopyRight/CopyRight";
import type { PageDimensions } from "@features/print/utils/pageFormat";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import { mmToPixelsExact } from "@features/print/utils/pageUnits";
import {
  selectDocumentStyle,
  selectDocumentCardDefaults,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import type { PagePlacement } from "@/types/document";
import {
  addSheetThunk,
  selectDocumentContent,
  selectNamedStyles,
  selectPageLayout,
  selectPages,
  selectSequenceKeys,
  selectSheetArea,
} from "@features/free-layout/store/freeLayoutThunks";
import {
  namedStyleOf,
  resolveBlockView,
} from "@features/free-layout/model/blockStyle";
import {
  sameSelection,
  useClearOnEscape,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import BlockSettingsLink from "@features/free-layout/components/BlockSettingsLink";
import AddSequenceDialog from "@features/free-layout/components/AddSequenceDialog";
import CardBaseMeasurer from "./CardBaseMeasurer";
import AutoSheetFlow from "./AutoSheetFlow";
import PageHeader from "./PageHeader";
import PlacementBox from "./PlacementBox";
import { useSequenceName } from "./useSequenceName";
import messages from "./FreeLayoutPages.lang";

/** Aire entre una pàgina i la capçalera de la següent, a la pantalla. */
const PAGE_GAP = 3;

/**
 * El marc del full a la pantalla. La pàgina activa (la que segueix la columna)
 * porta, a més, la guia `sheetGuide` per fora, separada del full: la mateixa
 * marca que el bloc seleccionat. És fora del full: no surt mai al paper.
 */
export const pageFrameSx = (active: boolean) =>
  active
    ? {
        boxShadow: (theme: Theme) => `0 0 0 2px ${theme.palette.primary.main}`,
        outline: `3px solid ${sheetGuide}`,
        outlineOffset: 4,
      }
    : {
        outline: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
      };

/** Llindars de l'observador: prou fins per saber quina pàgina es veu més. */
const VISIBLE_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Avisa de la pàgina que ocupa més pantalla (R5): és la que segueix la
 * columna. Sense `IntersectionObserver` (les proves), la primera.
 */
const useMostVisiblePage = (
  sections: React.MutableRefObject<(HTMLElement | null)[]>,
  pageIds: string,
  onVisible: (index: number) => void,
): void => {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const areas = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          areas.set(
            entry.target,
            entry.isIntersecting
              ? entry.intersectionRect.width * entry.intersectionRect.height
              : 0,
          ),
        );
        let best = -1;
        let bestArea = 0;
        sections.current.forEach((section, index) => {
          const area = (section && areas.get(section)) ?? 0;
          if (area > bestArea) {
            best = index;
            bestArea = area;
          }
        });
        if (best >= 0) onVisible(best);
      },
      { threshold: VISIBLE_THRESHOLDS },
    );
    sections.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, [sections, pageIds, onVisible]);
};

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
  const freeLayout = useAppSelector(selectPages);
  const direction = useAppSelector(selectPageLayout).direction ?? "row";
  // L'espai entre seqüències de les pàgines contínues que no en diuen cap
  const documentGap =
    useAppSelector(selectDocumentStyle).view.sequenceSpaceBetween;
  const content = useAppSelector(selectDocumentContent);
  const area = useAppSelector(selectSheetArea);
  const keys = useAppSelector(selectSequenceKeys);
  const views = useAppSelector(selectResolvedSequenceViews);
  const styles = useAppSelector(selectNamedStyles);
  const defaults = useAppSelector(selectDocumentCardDefaults);
  const sequenceName = useSequenceName();
  const {
    selection,
    select,
    clear,
    activePage,
    setVisiblePage,
    cardSizes,
    setCardSizes,
  } = useViewSelection();
  const clearOnEscape = useClearOnEscape();
  const theme = useTheme();
  // Al mòbil la columna és sota les pàgines: el bloc seleccionat hi porta
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const pageIds = freeLayout?.sheets.map(({ id }) => id).join() ?? "";
  const onVisible = useCallback(
    (index: number) => setVisiblePage(index),
    [setVisiblePage],
  );
  useMostVisiblePage(sections, pageIds, onVisible);

  const measured = useMemo(
    () => keys.map((key) => ({ key, pictograms: content[key] ?? [] })),
    [keys, content],
  );

  if (!freeLayout || !area) return null;
  const sheetCount = freeLayout.sheets.length;
  const areaHeightPx = mmToPixelsExact(area.h, CSS_PRINT_DPI);

  // Els blocs de text i els que l'app no entén encara no es pinten: es
  // conserven al document, i el bloc de text es pintarà amb la seva interfície
  // (R9, `docs/PLA-mode-lliure.md`)
  const renderPlacement = (
    placement: PagePlacement,
    sheetIndex: number,
    common: boolean,
  ) => {
    if (placement.kind !== "sequence") return null;
    const pictograms = content[placement.sequenceKey];
    const sequenceView = views[placement.sequenceKey];
    if (!pictograms || !sequenceView) return null;
    const view = resolveBlockView(
      sequenceView,
      namedStyleOf(styles, placement.styleId),
      placement.view,
    );
    const target = {
      kind: "block" as const,
      placementId: placement.id,
      sheetIndex,
    };
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
        scale={scale}
        selected={sameSelection(selection, target)}
        onSelect={() => select(target)}
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
    <Stack gap={PAGE_GAP} sx={{ minWidth: 0 }} onKeyDown={clearOnEscape}>
      <CardBaseMeasurer
        sequences={measured}
        defaults={defaults}
        onMeasure={setCardSizes}
      />

      {freeLayout.sheets.map((sheet, sheetIndex) => {
        // Contínua: les seqüències una darrere l'altra, com sempre. En blocs:
        // cada una a la seva caixa, i les comunes a sobre
        const continuous = sheet.mode === "auto";
        const empty = continuous
          ? !sheet.placements.some(({ kind }) => kind === "sequence")
          : sheet.placements.length === 0 && freeLayout.common.length === 0;
        // El peu de llicència, a totes les pàgines o només a l'última
        const footer =
          freeLayout.licenceOn !== "last" || sheetIndex === sheetCount - 1;
        // La pàgina que segueix la columna (la del nivell «Pàgina»)
        const active = sheetIndex === activePage;
        const selectedHere =
          selection?.kind === "block" && selection.sheetIndex === sheetIndex;
        return (
          <Stack
            key={sheet.id}
            ref={(element: HTMLElement | null) => {
              sections.current[sheetIndex] = element;
            }}
            component="section"
            gap={1}
            aria-current={active ? "true" : undefined}
            aria-label={intl.formatMessage(messages.pageLabel, {
              number: sheetIndex + 1,
              total: sheetCount,
            })}
          >
            <PageHeader
              sheetIndex={sheetIndex}
              sheetCount={sheetCount}
              placementCount={sheet.placements.length}
              continuous={continuous}
              active={active}
              onAddSequence={() => setAddingTo(sheetIndex)}
            />

            {/* Al mòbil, seleccionar no mou la pàgina (P9): l'enllaç baixa als ajustos */}
            {isNarrow && selectedHere && <BlockSettingsLink />}

            {/* El full encabit a la pantalla; a dins, a mida real i escalat.
                Un clic fora de cap bloc treu la selecció */}
            <Box
              onClick={clear}
              sx={{
                width: displayWidth,
                height: displayHeight,
                overflow: "hidden",
                // La pàgina activa, ressaltada amb la guia per fora del full,
                // com el bloc seleccionat; el marc verd hi continua
                ...pageFrameSx(active),
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
                {continuous && !empty && (
                  <AutoSheetFlow
                    sheetIndex={sheetIndex}
                    placements={sheet.placements}
                    direction={sheet.direction ?? direction}
                    gap={sheet.sequenceGap ?? documentGap}
                  />
                )}

                {/* L'àrea útil: les caixes hi van en mm des del cantó de dalt */}
                <Box
                  sx={{
                    // Una pàgina contínua només la fa servir per dir que és buida
                    display: continuous && !empty ? "none" : "block",
                    position: "relative",
                    width: "100%",
                    height: areaHeightPx,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {/* Les comunes, per sota de les de la pàgina */}
                  {!continuous &&
                    freeLayout.common.map((placement) =>
                      renderPlacement(placement, sheetIndex, true),
                    )}
                  {!continuous &&
                    sheet.placements.map((placement) =>
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
                  {footer && <CopyRight author={author} licence={licence} />}
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
