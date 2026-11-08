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
import type { DocumentSheet, PagePlacement } from "@/types/document";
import {
  addSheetThunk,
  addTextBlockThunk,
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
  resolveTextBlockStyle,
} from "@features/free-layout/model/blockStyle";
import {
  sameSelection,
  useClearOnEscape,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import AddSequenceDialog from "@features/free-layout/components/AddSequenceDialog";
import CardBaseMeasurer from "./CardBaseMeasurer";
import {
  arrangementOf,
  freeRegion,
  freeSlots,
  slotToBox,
  templateById,
} from "@features/free-layout/model/templates";
import EmptySlot from "./EmptySlot";
import { isBoxed } from "@features/free-layout/model/placement";
import AutoSheetFlow from "./AutoSheetFlow";
import PageHeader from "./PageHeader";
import SequenceBlock from "./SequenceBlock";
import TextBlock from "./TextBlock";
import TemplateGuides from "./TemplateGuides";
import GridDots from "./GridDots";
import { useSequenceName } from "./useSequenceName";
import {
  fullscreenScale,
  pageFrameId,
  pageSectionId,
  useFullscreenElementId,
} from "@features/free-layout/hooks/usePageView";
import messages from "./FreeLayoutPages.lang";

/** Quant ha de lliscar el dit, en px, per passar de pàgina al mòbil. */
const SWIPE_PX = 60;

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
  enabled: boolean,
): void => {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
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
  }, [sections, pageIds, onVisible, enabled]);
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
  /** Clicar el títol d'una pàgina: a dalt de tot i tan gran com hi càpiga */
  onFocusPage?: (index: number) => void;
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
  onFocusPage,
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
    templatePreview,
  } = useViewSelection();
  const clearOnEscape = useClearOnEscape();
  const theme = useTheme();
  // Al mòbil la columna és sota les pàgines: el bloc seleccionat hi porta
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));
  // On s'afegeixen seqüències: la pàgina i, des d'un bloc buit, l'espai
  const [addingTo, setAddingTo] = useState<{
    sheetIndex: number;
    slot?: number;
  } | null>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const pageIds = freeLayout?.sheets.map(({ id }) => id).join() ?? "";
  const onVisible = useCallback(
    (index: number) => setVisiblePage(index),
    [setVisiblePage],
  );
  // Al mòbil la pàgina que es mira la tria qui llisca, no l'observador
  useMostVisiblePage(sections, pageIds, onVisible, !isNarrow);
  const fullscreenId = useFullscreenElementId();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const measured = useMemo(
    () => keys.map((key) => ({ key, pictograms: content[key] ?? [] })),
    [keys, content],
  );

  if (!freeLayout || !area) return null;
  const sheetCount = freeLayout.sheets.length;
  const areaHeightPx = mmToPixelsExact(area.h, CSS_PRINT_DPI);

  // La part del full que deixen lliure els comuns: hi van els espais de les
  // plantilles, i també les guies de la que es previsualitza
  const region = freeRegion(area, freeLayout.common.filter(isBoxed));

  // Els espais de la plantilla que cap bloc no ocupa, amb la seva caixa
  const emptySlotsOf = (sheet: DocumentSheet) => {
    const template = sheet.template
      ? templateById(sheet.template, sheet.placements.filter(isBoxed).length)
      : undefined;
    if (!template) return [];
    return freeSlots(template, sheet.placements).map((slot) => ({
      slot,
      box: slotToBox(template.slots[slot], region),
    }));
  };

  // Els blocs que l'app no entén no es pinten: es conserven al document
  const renderPlacement = (
    placement: PagePlacement,
    sheetIndex: number,
    common: boolean,
  ) => {
    // Un bloc comú surt a totes les pàgines: no segueix el repartiment de cap
    const template = freeLayout.sheets[sheetIndex]?.template;
    const arrangement = common ? undefined : arrangementOf(template).kind;
    const target = {
      kind: "block" as const,
      placementId: placement.id,
      sheetIndex,
    };
    if (placement.kind === "text")
      return (
        <TextBlock
          key={placement.id}
          placement={placement}
          sheetIndex={sheetIndex}
          sheetCount={sheetCount}
          common={common}
          style={resolveTextBlockStyle(
            defaults.font,
            namedStyleOf(styles, placement.styleId),
            placement,
          )}
          scale={scale}
          area={area}
          selected={sameSelection(selection, target)}
          onSelect={() => select(target)}
        />
      );
    if (placement.kind !== "sequence") return null;
    const pictograms = content[placement.sequenceKey];
    const sequenceView = views[placement.sequenceKey];
    if (!pictograms || !sequenceView) return null;
    const view = resolveBlockView(
      sequenceView,
      namedStyleOf(styles, placement.styleId),
      placement.view,
    );
    return (
      <SequenceBlock
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
        area={area}
        arrangement={arrangement}
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

  // Al mòbil: passar a la pàgina anterior o la següent. La selecció d'un
  // bloc fixa la pàgina activa, i per això es treu
  const goToPage = (index: number) => {
    if (index < 0 || index >= sheetCount) return;
    clear();
    setVisiblePage(index);
  };
  const swipe = isNarrow
    ? {
        onTouchStart: (event: React.TouchEvent) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        },
        onTouchEnd: (event: React.TouchEvent) => {
          const start = touchStart.current;
          touchStart.current = null;
          const touch = event.changedTouches[0];
          if (!start || !touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          // Un lliscament horitzontal clar; el vertical és desplaçar-se
          if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5)
            return;
          goToPage(activePage + (dx < 0 ? 1 : -1));
        },
      }
    : {};

  return (
    <Stack
      gap={PAGE_GAP}
      sx={{ minWidth: 0 }}
      onKeyDown={clearOnEscape}
      {...swipe}
    >
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
        const isFullscreen = fullscreenId === pageFrameId(sheetIndex);
        const sheetScale = isFullscreen
          ? fullscreenScale(pageDimensions)
          : scale;
        // Al mòbil, una pàgina cada vegada: les altres hi són (s'imprimeixen
        // totes), però amagades; es passa d'una a l'altra lliscant
        const hidden = isNarrow && !active;
        const selectedHere =
          selection?.kind === "block" && selection.sheetIndex === sheetIndex;
        return (
          <Stack
            key={sheet.id}
            ref={(element: HTMLElement | null) => {
              sections.current[sheetIndex] = element;
            }}
            component="section"
            id={pageSectionId(sheetIndex)}
            gap={1}
            sx={{ display: hidden ? "none" : undefined }}
            aria-current={active ? "true" : undefined}
            aria-label={intl.formatMessage(messages.pageLabel, {
              number: sheetIndex + 1,
              total: sheetCount,
            })}
          >
            <PageHeader
              sheetIndex={sheetIndex}
              sheetCount={sheetCount}
              continuous={continuous}
              active={active}
              onAddSequence={() => setAddingTo({ sheetIndex })}
              onFocusPage={
                onFocusPage ? () => onFocusPage(sheetIndex) : undefined
              }
              // Al mòbil, una pàgina cada vegada: les fletxes, al costat del títol
              onPrevious={
                isNarrow && sheetCount > 1
                  ? () => goToPage(sheetIndex - 1)
                  : undefined
              }
              onNext={
                isNarrow && sheetCount > 1
                  ? () => goToPage(sheetIndex + 1)
                  : undefined
              }
            />

            {/* El full encabit a la pantalla; a dins, a mida real i escalat.
                Un clic fora de cap bloc treu la selecció. A pantalla completa,
                el full tan gran com hi càpiga, al mig i sense marques
                d'edició */}
            <Box
              id={pageFrameId(sheetIndex)}
              onClick={clear}
              sx={{
                width: displayWidth,
                height: displayHeight,
                // La pàgina activa, ressaltada amb la guia per fora del full,
                // com el bloc seleccionat; el marc verd hi continua
                // Al mòbil no hi ha marge per a la guia de fora, i la pàgina
                // que es veu és sempre l'activa
                ...pageFrameSx(active && !isNarrow),
                "&:fullscreen": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none",
                  boxShadow: "none",
                  backgroundColor: "background.default",
                },
                "&:fullscreen [data-html2canvas-ignore]": { display: "none" },
              }}
            >
              <Box
                sx={{
                  width: isFullscreen
                    ? pageDimensions.width * sheetScale
                    : displayWidth,
                  height: isFullscreen
                    ? pageDimensions.height * sheetScale
                    : displayHeight,
                  overflow: "hidden",
                  backgroundColor: sheetSurface,
                }}
              >
                <Box
                  className="preview-content"
                  sx={{
                    width: pageDimensions.width,
                    height: pageDimensions.height,
                    transform: `scale(${sheetScale})`,
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

                    {/* Els espais lliures del repartiment: blocs buits per omplir */}
                    {!continuous &&
                      emptySlotsOf(sheet).map(({ slot, box }) => (
                        <EmptySlot
                          key={`empty-${slot}`}
                          box={box}
                          number={slot + 1}
                          scale={scale}
                          onAddSequence={() =>
                            setAddingTo({ sheetIndex, slot })
                          }
                          onAddText={() => {
                            const placementId = dispatch(
                              addTextBlockThunk(sheetIndex, slot),
                            );
                            select({ kind: "block", placementId, sheetIndex });
                            showSnackbar({
                              message: intl.formatMessage(
                                messages.textBlockAdded,
                                { number: sheetIndex + 1 },
                              ),
                              severity: "success",
                            });
                          }}
                        />
                      ))}

                    {/* La quadrícula de punts, amb un bloc seleccionat en aquesta
                      pàgina: s'hi mou i s'hi enganxa (fase 4) */}
                    {!continuous && selectedHere && <GridDots area={area} />}

                    {templatePreview?.sheetIndex === sheetIndex && (
                      <TemplateGuides
                        template={templatePreview.template}
                        region={region}
                      />
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
                          onClick={() => setAddingTo({ sheetIndex })}
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
            </Box>
          </Stack>
        );
      })}

      {/* Al mòbil, «Afegeix una pàgina» és al menú «⋯» de la pàgina */}
      <Box
        sx={{
          display: isNarrow ? "none" : undefined,
          "@media print": { display: "none" },
        }}
      >
        <StyledButton
          color="inherit"
          startIcon={<MdAdd />}
          onClick={handleAddPage}
        >
          {intl.formatMessage(messages.addPage)}
        </StyledButton>
      </Box>

      <AddSequenceDialog
        sheetIndex={addingTo?.sheetIndex ?? null}
        slot={addingTo?.slot}
        onClose={() => setAddingTo(null)}
      />
    </Stack>
  );
};

export default FreeLayoutPages;
